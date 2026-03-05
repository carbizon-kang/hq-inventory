"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Transaction } from "@/types";

const LS_KEY = "hq_transactions";

interface TransactionStore {
  transactions: Transaction[];
  addTransaction: (t: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: string) => void;
}

const TransactionContext = createContext<TransactionStore | null>(null);

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem(LS_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(transactions));
  }, [transactions]);

  function addTransaction(t: Omit<Transaction, "id">) {
    // 최신 기록이 맨 위에 표시되도록 앞에 추가
    const newT: Transaction = { ...t, id: `t${Date.now()}` };
    setTransactions((prev) => [newT, ...prev]);
  }

  function deleteTransaction(id: string) {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <TransactionContext.Provider value={{ transactions, addTransaction, deleteTransaction }}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const ctx = useContext(TransactionContext);
  if (!ctx) throw new Error("useTransactions는 TransactionProvider 안에서만 사용할 수 있습니다.");
  return ctx;
}
