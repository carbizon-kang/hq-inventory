"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Asset, AssetTransfer } from "@/types";
import { MOCK_ASSETS, MOCK_TRANSFERS } from "./mockData";

const LS_ASSETS = "hq_assets";
const LS_TRANSFERS = "hq_transfers";

interface AssetContextType {
  assets: Asset[];
  transfers: AssetTransfer[];
  addAsset: (asset: Omit<Asset, "id">) => void;
  updateAsset: (id: string, data: Partial<Omit<Asset, "id">>) => void;
  deleteAsset: (id: string) => void;
  addTransfer: (transfer: Omit<AssetTransfer, "id">) => void;
  getAssetTransfers: (assetId: string) => AssetTransfer[];
}

const AssetContext = createContext<AssetContextType | null>(null);

export function AssetProvider({ children }: { children: ReactNode }) {
  const [assets, setAssets] = useState<Asset[]>(() => {
    if (typeof window === "undefined") return MOCK_ASSETS;
    const saved = localStorage.getItem(LS_ASSETS);
    return saved ? JSON.parse(saved) : MOCK_ASSETS;
  });

  const [transfers, setTransfers] = useState<AssetTransfer[]>(() => {
    if (typeof window === "undefined") return MOCK_TRANSFERS;
    const saved = localStorage.getItem(LS_TRANSFERS);
    return saved ? JSON.parse(saved) : MOCK_TRANSFERS;
  });

  useEffect(() => {
    localStorage.setItem(LS_ASSETS, JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem(LS_TRANSFERS, JSON.stringify(transfers));
  }, [transfers]);

  function addAsset(asset: Omit<Asset, "id">) {
    const newAsset: Asset = { ...asset, id: `a${Date.now()}` };
    setAssets((prev) => [...prev, newAsset]);
  }

  function updateAsset(id: string, data: Partial<Omit<Asset, "id">>) {
    setAssets((prev) => prev.map((a) => (a.id === id ? { ...a, ...data } : a)));
  }

  function deleteAsset(id: string) {
    setAssets((prev) => prev.filter((a) => a.id !== id));
  }

  function addTransfer(transfer: Omit<AssetTransfer, "id">) {
    const newTransfer: AssetTransfer = { ...transfer, id: `tr${Date.now()}` };
    // 이동 후 자산의 branchId 업데이트
    updateAsset(transfer.assetId, { branchId: transfer.toBranchId });
    setTransfers((prev) => [newTransfer, ...prev]);
  }

  function getAssetTransfers(assetId: string) {
    return transfers.filter((t) => t.assetId === assetId);
  }

  return (
    <AssetContext.Provider value={{ assets, transfers, addAsset, updateAsset, deleteAsset, addTransfer, getAssetTransfers }}>
      {children}
    </AssetContext.Provider>
  );
}

export function useAssets() {
  const ctx = useContext(AssetContext);
  if (!ctx) throw new Error("useAssets must be used within AssetProvider");
  return ctx;
}
