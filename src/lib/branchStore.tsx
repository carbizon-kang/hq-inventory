"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Branch } from "@/types";
import { supabase } from "./supabase";

interface BranchContextType {
  branches: Branch[];
  loading: boolean;
  addBranch: (b: Omit<Branch, "id">) => Promise<void>;
  updateBranch: (id: string, data: Partial<Omit<Branch, "id">>) => Promise<void>;
  deleteBranch: (id: string) => Promise<void>;
}

const BranchContext = createContext<BranchContextType | null>(null);

export function BranchProvider({ children }: { children: ReactNode }) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBranches();

    // 실시간 동기화: 다른 브라우저/지사에서 변경 시 자동 반영
    const channel = supabase
      .channel("branches-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "branches" }, loadBranches)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  async function loadBranches() {
    const { data } = await supabase.from("branches").select("*").order("name");
    if (data) setBranches(data as Branch[]);
    setLoading(false);
  }

  async function addBranch(b: Omit<Branch, "id">) {
    const id = `b${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
    const { error } = await supabase.from("branches").insert({ ...b, id });
    if (error) throw new Error(`지사 추가 실패: ${error.message}`);
    await loadBranches(); // 즉시 목록 갱신
  }

  async function updateBranch(id: string, data: Partial<Omit<Branch, "id">>) {
    const { error } = await supabase.from("branches").update(data).eq("id", id);
    if (error) throw new Error(`지사 수정 실패: ${error.message}`);
    await loadBranches();
  }

  async function deleteBranch(id: string) {
    const { error } = await supabase.from("branches").delete().eq("id", id);
    if (error) throw new Error(`지사 삭제 실패: ${error.message}`);
    await loadBranches();
  }

  return (
    <BranchContext.Provider value={{ branches, loading, addBranch, updateBranch, deleteBranch }}>
      {children}
    </BranchContext.Provider>
  );
}

export function useBranches() {
  const ctx = useContext(BranchContext);
  if (!ctx) throw new Error("useBranches는 BranchProvider 안에서만 사용할 수 있습니다.");
  return ctx;
}
