"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "./supabase";

export interface ItemName {
  id: string;
  name: string;
  prefix: string;
  isDefault: boolean;
}

interface ItemContextType {
  items: ItemName[];
  loading: boolean;
  addItem: (name: string, prefix: string) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
}

const ItemContext = createContext<ItemContextType | null>(null);

function rowToItem(r: Record<string, unknown>): ItemName {
  return {
    id: r.id as string,
    name: r.name as string,
    prefix: r.prefix as string,
    isDefault: (r.is_default as boolean) || false,
  };
}

export function ItemProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ItemName[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    const { data } = await supabase.from("item_names").select("*").order("name");
    if (data) setItems(data.map(rowToItem));
    setLoading(false);
  }

  async function addItem(name: string, prefix: string) {
    const { error } = await supabase.from("item_names").insert({
      id: `item${Date.now()}`,
      name: name.trim(),
      prefix: prefix.trim().toUpperCase(),
      is_default: false,
    });
    if (error) throw new Error(`품명 추가 실패: ${error.message}`);
    await loadItems();
  }

  async function deleteItem(id: string) {
    const { error } = await supabase.from("item_names").delete().eq("id", id);
    if (error) throw new Error(`품명 삭제 실패: ${error.message}`);
    await loadItems();
  }

  return (
    <ItemContext.Provider value={{ items, loading, addItem, deleteItem }}>
      {children}
    </ItemContext.Provider>
  );
}

export function useItems() {
  const ctx = useContext(ItemContext);
  if (!ctx) throw new Error("useItems must be used within ItemProvider");
  return ctx;
}
