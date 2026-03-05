"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Branch } from "@/types";
import { MOCK_BRANCHES } from "./mockData";

const LS_KEY = "hq_branches";

interface BranchStore {
  branches: Branch[];
  addBranch: (branch: Omit<Branch, "id">) => void;
  updateBranch: (id: string, updated: Partial<Branch>) => void;
  deleteBranch: (id: string) => void;
}

const BranchContext = createContext<BranchStore | null>(null);

export function BranchProvider({ children }: { children: ReactNode }) {
  const [branches, setBranches] = useState<Branch[]>(() => {
    if (typeof window === "undefined") return MOCK_BRANCHES;
    const saved = localStorage.getItem(LS_KEY);
    return saved ? JSON.parse(saved) : MOCK_BRANCHES;
  });

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(branches));
  }, [branches]);

  function addBranch(branch: Omit<Branch, "id">) {
    const newBranch: Branch = { ...branch, id: `b${Date.now()}` };
    setBranches((prev) => [...prev, newBranch]);
  }

  function updateBranch(id: string, updated: Partial<Branch>) {
    setBranches((prev) => prev.map((b) => (b.id === id ? { ...b, ...updated } : b)));
  }

  function deleteBranch(id: string) {
    setBranches((prev) => prev.filter((b) => b.id !== id));
  }

  return (
    <BranchContext.Provider value={{ branches, addBranch, updateBranch, deleteBranch }}>
      {children}
    </BranchContext.Provider>
  );
}

export function useBranches() {
  const ctx = useContext(BranchContext);
  if (!ctx) throw new Error("useBranches는 BranchProvider 안에서만 사용할 수 있습니다.");
  return ctx;
}
