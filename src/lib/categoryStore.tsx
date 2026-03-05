"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Category } from "@/types";
import { INITIAL_CATEGORIES } from "./mockData";

const LS_KEY = "hq_categories";

interface CategoryContextType {
  categories: Category[];
  addCategory: (name: string) => void;
  deleteCategory: (id: string) => void;
}

const CategoryContext = createContext<CategoryContextType | null>(null);

export function CategoryProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>(() => {
    if (typeof window === "undefined") return INITIAL_CATEGORIES;
    const saved = localStorage.getItem(LS_KEY);
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(categories));
  }, [categories]);

  function addCategory(name: string) {
    const newCat: Category = {
      id: `cat${Date.now()}`,
      name: name.trim(),
      isDefault: false,
    };
    setCategories((prev) => [...prev, newCat]);
  }

  function deleteCategory(id: string) {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <CategoryContext.Provider value={{ categories, addCategory, deleteCategory }}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories() {
  const ctx = useContext(CategoryContext);
  if (!ctx) throw new Error("useCategories must be used within CategoryProvider");
  return ctx;
}
