"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Asset, AssetTransfer } from "@/types";
import { supabase } from "./supabase";

interface AssetContextType {
  assets: Asset[];
  transfers: AssetTransfer[];
  loading: boolean;
  addAsset: (asset: Omit<Asset, "id">) => Promise<void>;
  updateAsset: (id: string, data: Partial<Omit<Asset, "id">>) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;
  addTransfer: (transfer: Omit<AssetTransfer, "id">) => Promise<void>;
  getAssetTransfers: (assetId: string) => AssetTransfer[];
}

const AssetContext = createContext<AssetContextType | null>(null);

// DB row → TypeScript 타입 변환
function rowToAsset(r: Record<string, unknown>): Asset {
  return {
    id: r.id as string,
    assetNumber: r.asset_number as string,
    name: r.name as string,
    category: r.category as string,
    branchId: r.branch_id as string,
    status: r.status as Asset["status"],
    purchaseDate: r.purchase_date as string,
    note: (r.note as string) || "",
  };
}

function rowToTransfer(r: Record<string, unknown>): AssetTransfer {
  return {
    id: r.id as string,
    assetId: r.asset_id as string,
    fromBranchId: r.from_branch_id as string,
    toBranchId: r.to_branch_id as string,
    transferDate: r.transfer_date as string,
    manager: r.manager as string,
    reason: (r.reason as string) || "",
  };
}

export function AssetProvider({ children }: { children: ReactNode }) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [transfers, setTransfers] = useState<AssetTransfer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();

    const assetChannel = supabase
      .channel("assets-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "assets" }, loadAssets)
      .subscribe();

    const transferChannel = supabase
      .channel("transfers-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "asset_transfers" }, loadTransfers)
      .subscribe();

    return () => {
      supabase.removeChannel(assetChannel);
      supabase.removeChannel(transferChannel);
    };
  }, []);

  async function loadAll() {
    await Promise.all([loadAssets(), loadTransfers()]);
    setLoading(false);
  }

  async function loadAssets() {
    const { data } = await supabase.from("assets").select("*").order("asset_number");
    if (data) setAssets(data.map(rowToAsset));
  }

  async function loadTransfers() {
    const { data } = await supabase.from("asset_transfers").select("*").order("transfer_date", { ascending: false });
    if (data) setTransfers(data.map(rowToTransfer));
  }

  async function addAsset(asset: Omit<Asset, "id">) {
    await supabase.from("assets").insert({
      id: `a${Date.now()}`,
      asset_number: asset.assetNumber,
      name: asset.name,
      category: asset.category,
      branch_id: asset.branchId,
      status: asset.status,
      purchase_date: asset.purchaseDate,
      note: asset.note,
    });
  }

  async function updateAsset(id: string, data: Partial<Omit<Asset, "id">>) {
    const row: Record<string, unknown> = {};
    if (data.assetNumber !== undefined) row.asset_number = data.assetNumber;
    if (data.name !== undefined) row.name = data.name;
    if (data.category !== undefined) row.category = data.category;
    if (data.branchId !== undefined) row.branch_id = data.branchId;
    if (data.status !== undefined) row.status = data.status;
    if (data.purchaseDate !== undefined) row.purchase_date = data.purchaseDate;
    if (data.note !== undefined) row.note = data.note;
    await supabase.from("assets").update(row).eq("id", id);
  }

  async function deleteAsset(id: string) {
    await supabase.from("assets").delete().eq("id", id);
  }

  async function addTransfer(transfer: Omit<AssetTransfer, "id">) {
    // 이동 이력 기록 + 자산 지사 업데이트를 동시에 처리
    await Promise.all([
      supabase.from("asset_transfers").insert({
        id: `tr${Date.now()}`,
        asset_id: transfer.assetId,
        from_branch_id: transfer.fromBranchId,
        to_branch_id: transfer.toBranchId,
        transfer_date: transfer.transferDate,
        manager: transfer.manager,
        reason: transfer.reason,
      }),
      supabase.from("assets").update({ branch_id: transfer.toBranchId }).eq("id", transfer.assetId),
    ]);
  }

  function getAssetTransfers(assetId: string) {
    return transfers.filter((t) => t.assetId === assetId);
  }

  return (
    <AssetContext.Provider value={{ assets, transfers, loading, addAsset, updateAsset, deleteAsset, addTransfer, getAssetTransfers }}>
      {children}
    </AssetContext.Provider>
  );
}

export function useAssets() {
  const ctx = useContext(AssetContext);
  if (!ctx) throw new Error("useAssets must be used within AssetProvider");
  return ctx;
}
