"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { InventoryItem } from "@/types";
import { MOCK_INVENTORY } from "./mockData";

const LS_KEY = "hq_inventory";

interface InventoryStore {
  items: InventoryItem[];
  addItem: (item: Omit<InventoryItem, "id">) => void;
  updateItem: (id: string, updated: Partial<InventoryItem>) => void;
  deleteItem: (id: string) => void;
}

const InventoryContext = createContext<InventoryStore | null>(null);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<InventoryItem[]>(() => {
    // SSR 환경에서는 Mock 데이터 반환
    if (typeof window === "undefined") return MOCK_INVENTORY;
    const saved = localStorage.getItem(LS_KEY);
    return saved ? JSON.parse(saved) : MOCK_INVENTORY;
  });

  // items 변경 시 localStorage에 자동 저장
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  }, [items]);

  function addItem(item: Omit<InventoryItem, "id">) {
    const newItem: InventoryItem = { ...item, id: `i${Date.now()}` };
    setItems((prev) => [...prev, newItem]);
  }

  function updateItem(id: string, updated: Partial<InventoryItem>) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );
  }

  function deleteItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <InventoryContext.Provider value={{ items, addItem, updateItem, deleteItem }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error("useInventory는 InventoryProvider 안에서만 사용할 수 있습니다.");
  return ctx;
}
