"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Category } from "@/types";
import { supabase } from "./supabase";

interface CategoryContextType {
  categories: Category[];
  loading: boolean;
  addCategory: (name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

const CategoryContext = createContext<CategoryContextType | null>(null);

export function CategoryProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();

    const channel = supabase
      .channel("categories-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "categories" }, loadCategories)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  async function loadCategories() {
    const { data } = await supabase.from("categories").select("*").order("name");
    if (data) {
      setCategories(data.map((r) => ({
        id: r.id,
        name: r.name,
        isDefault: r.is_default,
      })));
    }
    setLoading(false);
  }

  async function addCategory(name: string) {
    await supabase.from("categories").insert({
      id: `cat${Date.now()}`,
      name: name.trim(),
      is_default: false,
    });
  }

  async function deleteCategory(id: string) {
    await supabase.from("categories").delete().eq("id", id);
  }

  return (
    <CategoryContext.Provider value={{ categories, loading, addCategory, deleteCategory }}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories() {
  const ctx = useContext(CategoryContext);
  if (!ctx) throw new Error("useCategories must be used within CategoryProvider");
  return ctx;
}
