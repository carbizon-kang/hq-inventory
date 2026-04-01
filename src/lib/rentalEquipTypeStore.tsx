"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "./supabase";

interface RentalEquipType {
  id: string;
  name: string;
  isDefault: boolean;
}

interface RentalEquipTypeContextType {
  equipTypes: RentalEquipType[];
  loading: boolean;
  addEquipType: (name: string) => Promise<void>;
  deleteEquipType: (id: string) => Promise<void>;
}

const RentalEquipTypeContext = createContext<RentalEquipTypeContextType | null>(null);

export function RentalEquipTypeProvider({ children }: { children: ReactNode }) {
  const [equipTypes, setEquipTypes] = useState<RentalEquipType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEquipTypes();

    const channel = supabase
      .channel("rental-equip-types-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "rental_equip_types" }, loadEquipTypes)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  async function loadEquipTypes() {
    const { data } = await supabase.from("rental_equip_types").select("*").order("name");
    if (data) {
      setEquipTypes(data.map((r) => ({
        id: r.id,
        name: r.name,
        isDefault: r.is_default,
      })));
    }
    setLoading(false);
  }

  async function addEquipType(name: string) {
    await supabase.from("rental_equip_types").insert({
      id: `ret_${Date.now()}`,
      name: name.trim(),
      is_default: false,
    });
  }

  async function deleteEquipType(id: string) {
    await supabase.from("rental_equip_types").delete().eq("id", id);
  }

  return (
    <RentalEquipTypeContext.Provider value={{ equipTypes, loading, addEquipType, deleteEquipType }}>
      {children}
    </RentalEquipTypeContext.Provider>
  );
}

export function useRentalEquipTypes() {
  const ctx = useContext(RentalEquipTypeContext);
  if (!ctx) throw new Error("useRentalEquipTypes must be used within RentalEquipTypeProvider");
  return ctx;
}
