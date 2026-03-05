"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { InventoryItem, StockStatus } from "@/types";
import { Branch } from "@/types";
import StockBadge from "@/components/ui/StockBadge";
import { getStockStatus } from "@/lib/inventory";
import { useInventory } from "@/lib/inventoryStore";

interface InventoryTableProps {
  items: InventoryItem[];
  branches: Branch[];
  // 지사 상세 페이지처럼 지사 필터를 숨기고 싶을 때 사용
  hideBranchFilter?: boolean;
}

type SortKey = "name" | "quantity" | "lastUpdated";
type SortDir = "asc" | "desc";

export default function InventoryTable({ items, branches, hideBranchFilter }: InventoryTableProps) {
  const router = useRouter();
  const { deleteItem } = useInventory();

  const [search, setSearch] = useState("");
  const [filterBranch, setFilterBranch] = useState("전체");
  const [filterCategory, setFilterCategory] = useState("전체");
  const [filterStatus, setFilterStatus] = useState<StockStatus | "전체">("전체");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category));
    return ["전체", ...Array.from(set)];
  }, [items]);

  const filtered = useMemo(() => {
    return items
      .filter((item) => {
        const matchSearch = item.name.includes(search);
        const matchBranch = hideBranchFilter || filterBranch === "전체" || item.branchId === filterBranch;
        const matchCategory = filterCategory === "전체" || item.category === filterCategory;
        const matchStatus = filterStatus === "전체" || getStockStatus(item) === filterStatus;
        return matchSearch && matchBranch && matchCategory && matchStatus;
      })
      .sort((a, b) => {
        let valA: string | number = a[sortKey];
        let valB: string | number = b[sortKey];
        if (sortKey === "quantity") { valA = a.quantity; valB = b.quantity; }
        if (valA < valB) return sortDir === "asc" ? -1 : 1;
        if (valA > valB) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
  }, [items, search, filterBranch, filterCategory, filterStatus, sortKey, sortDir, hideBranchFilter]);

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  function handleDelete(id: string) {
    deleteItem(id);
    setConfirmDeleteId(null);
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <span className="text-gray-300 ml-1">↕</span>;
    return <span className="text-blue-500 ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>;
  }

  return (
    <div>
      {/* 필터 영역 */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="품목명 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          {!hideBranchFilter && (
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
          )}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c === "전체" ? "전체 카테고리" : c}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as StockStatus | "전체")}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="전체">전체 상태</option>
            <option value="정상">정상</option>
            <option value="부족">부족</option>
            <option value="위험">위험</option>
          </select>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-sm text-gray-400">
              총 <span className="font-semibold text-gray-700">{filtered.length}</span>건
            </span>
            <Link
              href="/inventory/new"
              className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              + 재고 추가
            </Link>
          </div>
        </div>
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <th className="px-5 py-3 text-left cursor-pointer hover:text-gray-700 select-none" onClick={() => handleSort("name")}>
                  품목명 <SortIcon col="name" />
                </th>
                <th className="px-5 py-3 text-left">카테고리</th>
                {!hideBranchFilter && <th className="px-5 py-3 text-left">지사</th>}
                <th className="px-5 py-3 text-right cursor-pointer hover:text-gray-700 select-none" onClick={() => handleSort("quantity")}>
                  현재 수량 <SortIcon col="quantity" />
                </th>
                <th className="px-5 py-3 text-right">최소 재고</th>
                <th className="px-5 py-3 text-center">상태</th>
                <th className="px-5 py-3 text-right cursor-pointer hover:text-gray-700 select-none" onClick={() => handleSort("lastUpdated")}>
                  최근 업데이트 <SortIcon col="lastUpdated" />
                </th>
                <th className="px-5 py-3 text-center">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={hideBranchFilter ? 7 : 8} className="text-center py-12 text-gray-400">
                    조건에 맞는 재고 항목이 없습니다.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const branch = branches.find((b) => b.id === item.branchId);
                  const status = getStockStatus(item);
                  const isLow = status !== "정상";
                  const isConfirming = confirmDeleteId === item.id;

                  return (
                    <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${isLow ? "bg-red-50/30" : ""}`}>
                      <td className="px-5 py-3 font-medium text-gray-800">{item.name}</td>
                      <td className="px-5 py-3 text-gray-500">{item.category}</td>
                      {!hideBranchFilter && (
                        <td className="px-5 py-3 text-gray-500">{branch?.name ?? "-"}</td>
                      )}
                      <td className="px-5 py-3 text-right font-semibold text-gray-800">
                        {item.quantity.toLocaleString()}
                        <span className="text-xs text-gray-400 ml-1">{item.unit}</span>
                      </td>
                      <td className="px-5 py-3 text-right text-gray-400">
                        {item.minimumStock.toLocaleString()}
                        <span className="text-xs ml-1">{item.unit}</span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <StockBadge status={status} />
                      </td>
                      <td className="px-5 py-3 text-right text-gray-400">{item.lastUpdated}</td>
                      <td className="px-5 py-3 text-center">
                        {isConfirming ? (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleDelete(item.id)}
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
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => router.push(`/inventory/${item.id}/edit`)}
                              className="text-xs text-blue-600 hover:underline"
                            >
                              수정
                            </button>
                            <span className="text-gray-200">|</span>
                            <button
                              onClick={() => setConfirmDeleteId(item.id)}
                              className="text-xs text-red-400 hover:underline"
                            >
                              삭제
                            </button>
                          </div>
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
