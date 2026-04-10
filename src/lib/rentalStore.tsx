"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { RentalItem } from "@/types";
import { supabase } from "./supabase";

interface RentalContextType {
  rentals: RentalItem[];
  loading: boolean;
  addRental: (item: Omit<RentalItem, "id">) => Promise<void>;
  updateRental: (id: string, data: Partial<Omit<RentalItem, "id">>) => Promise<void>;
  deleteRental: (id: string) => Promise<void>;
}

const RentalContext = createContext<RentalContextType | null>(null);

function rowToRental(r: Record<string, unknown>): RentalItem {
  return {
    id: r.id as string,
    branchId: r.branch_id as string,
    equipType: r.equip_type as RentalItem["equipType"],
    modelName: (r.model_name as string) || "",
    vendor: (r.vendor as string) || "",
    monthlyFee: (r.monthly_fee as number) || 0,
    startDate: r.start_date as string,
    endDate: r.end_date as string,
    deposit: (r.deposit as boolean) || false,
    depositAmount: (r.deposit_amount as number) || 0,
    waterPurifierType: (r.water_purifier_type as RentalItem["waterPurifierType"]) || "",
    carUser: (r.car_user as string) || "",
    status: r.status as RentalItem["status"],
    note: (r.note as string) || "",
  };
}

export function RentalProvider({ children }: { children: ReactNode }) {
  const [rentals, setRentals] = useState<RentalItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRentals().finally(() => setLoading(false));

    const channel = supabase
      .channel("rentals-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "rentals" }, loadRentals)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  async function loadRentals() {
    const { data } = await supabase.from("rentals").select("*").order("start_date", { ascending: false });
    if (data) setRentals(data.map(rowToRental));
  }

  async function addRental(item: Omit<RentalItem, "id">) {
    const { error } = await supabase.from("rentals").insert({
      id: `rent${Date.now()}`,
      branch_id: item.branchId,
      equip_type: item.equipType,
      model_name: item.modelName,
      vendor: item.vendor,
      monthly_fee: item.monthlyFee,
      start_date: item.startDate,
      end_date: item.endDate,
      deposit: item.deposit,
      deposit_amount: item.depositAmount,
      water_purifier_type: item.waterPurifierType,
      car_user: item.carUser,
      status: item.status,
      note: item.note,
    });
    if (error) throw new Error(`렌트 등록 실패: ${error.message}`);
    await loadRentals();
  }

  async function updateRental(id: string, data: Partial<Omit<RentalItem, "id">>) {
    const row: Record<string, unknown> = {};
    if (data.branchId !== undefined) row.branch_id = data.branchId;
    if (data.equipType !== undefined) row.equip_type = data.equipType;
    if (data.modelName !== undefined) row.model_name = data.modelName;
    if (data.vendor !== undefined) row.vendor = data.vendor;
    if (data.monthlyFee !== undefined) row.monthly_fee = data.monthlyFee;
    if (data.startDate !== undefined) row.start_date = data.startDate;
    if (data.endDate !== undefined) row.end_date = data.endDate;
    if (data.deposit !== undefined) row.deposit = data.deposit;
    if (data.depositAmount !== undefined) row.deposit_amount = data.depositAmount;
    if (data.waterPurifierType !== undefined) row.water_purifier_type = data.waterPurifierType;
    if (data.carUser !== undefined) row.car_user = data.carUser;
    if (data.status !== undefined) row.status = data.status;
    if (data.note !== undefined) row.note = data.note;
    const { error } = await supabase.from("rentals").update(row).eq("id", id);
    if (error) throw new Error(`렌트 수정 실패: ${error.message}`);
    await loadRentals();
  }

  async function deleteRental(id: string) {
    const { error } = await supabase.from("rentals").delete().eq("id", id);
    if (error) throw new Error(`렌트 삭제 실패: ${error.message}`);
    await loadRentals();
  }

  return (
    <RentalContext.Provider value={{ rentals, loading, addRental, updateRental, deleteRental }}>
      {children}
    </RentalContext.Provider>
  );
}

export function useRentals() {
  const ctx = useContext(RentalContext);
  if (!ctx) throw new Error("useRentals must be used within RentalProvider");
  return ctx;
}
