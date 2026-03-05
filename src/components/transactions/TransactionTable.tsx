"use client";

import { useState, useMemo } from "react";
import { Transaction, InventoryItem, Branch } from "@/types";
import { useTransactions } from "@/lib/transactionStore";

interface TransactionTableProps {
  transactions: Transaction[];
  items: InventoryItem[];
  branches: Branch[];
}

export default function TransactionTable({ transactions, items, branches }: TransactionTableProps) {
  const { deleteTransaction } = useTransactions();
  const [filterType, setFilterType] = useState<"전체" | "입고" | "출고">("전체");
  const [filterBranch, setFilterBranch] = useState("전체");
  const [search, setSearch] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const item = items.find((i) => i.id === t.itemId);
      const matchType = filterType === "전체" || t.type === filterType;
      const matchBranch = filterBranch === "전체" || t.branchId === filterBranch;
      const matchSearch =
        !search ||
        (item?.name ?? "").includes(search) ||
        t.manager.includes(search);
      return matchType && matchBranch && matchSearch;
    });
  }, [transactions, items, filterType, filterBranch, search]);

  return (
    <div>
      {/* 필터 */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4">
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="품목명 또는 담당자 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-52 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <select
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="전체">전체 지사</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as "전체" | "입고" | "출고")}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="전체">전체 구분</option>
            <option value="입고">입고</option>
            <option value="출고">출고</option>
          </select>
          <span className="ml-auto text-sm text-gray-400">
            총 <span className="font-semibold text-gray-700">{filtered.length}</span>건
          </span>
        </div>
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <th className="px-5 py-3 text-left">날짜</th>
                <th className="px-5 py-3 text-left">지사</th>
                <th className="px-5 py-3 text-left">품목명</th>
                <th className="px-5 py-3 text-center">구분</th>
                <th className="px-5 py-3 text-right">수량</th>
                <th className="px-5 py-3 text-left">담당자</th>
                <th className="px-5 py-3 text-left">비고</th>
                <th className="px-5 py-3 text-center">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400">
                    입출고 이력이 없습니다.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => {
                  const item = items.find((i) => i.id === t.itemId);
                  const branch = branches.find((b) => b.id === t.branchId);
                  const isConfirming = confirmDeleteId === t.id;

                  return (
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 text-gray-500">{t.date}</td>
                      <td className="px-5 py-3 text-gray-500">{branch?.name ?? "-"}</td>
                      <td className="px-5 py-3 font-medium text-gray-800">{item?.name ?? "-"}</td>
                      <td className="px-5 py-3 text-center">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            t.type === "입고"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {t.type}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-gray-800">
                        <span className={t.type === "입고" ? "text-blue-600" : "text-orange-600"}>
                          {t.type === "입고" ? "+" : "-"}{t.quantity.toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-400 ml-1">{item?.unit ?? ""}</span>
                      </td>
                      <td className="px-5 py-3 text-gray-500">{t.manager}</td>
                      <td className="px-5 py-3 text-gray-400 text-xs">{t.note || "-"}</td>
                      <td className="px-5 py-3 text-center">
                        {isConfirming ? (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => { deleteTransaction(t.id); setConfirmDeleteId(null); }}
                              className="text-xs text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded transition-colors"
                            >
                              확인
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded border border-gray-200 transition-colors"
                            >
                              취소
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(t.id)}
                            className="text-xs text-red-400 hover:underline"
                          >
                            삭제
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
