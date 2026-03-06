"use client";

import { useState } from "react";
import Link from "next/link";
import { Asset, Branch } from "@/types";
import { useAssets } from "@/lib/assetStore";
import { useCategories } from "@/lib/categoryStore";

const STATUS_COLORS: Record<string, string> = {
  "사용중": "bg-green-100 text-green-700",
  "보관중": "bg-blue-100 text-blue-700",
  "수리중": "bg-yellow-100 text-yellow-700",
  "폐기": "bg-red-100 text-red-700",
};

interface AssetTableProps {
  assets: Asset[];
  branches: Branch[];
}

export default function AssetTable({ assets, branches }: AssetTableProps) {
  const { deleteAsset } = useAssets();
  const { categories } = useCategories();
  const [search, setSearch] = useState("");
  const [filterName, setFilterName] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterBranch, setFilterBranch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const getBranchName = (id: string) => branches.find((b) => b.id === id)?.name ?? id;

  // 품명 목록 (중복 제거)
  const uniqueNames = Array.from(new Set(assets.map((a) => a.name))).sort();

  const filtered = assets.filter((a) => {
    const matchSearch =
      !search ||
      a.name.includes(search) ||
      a.assetNumber.includes(search);
    const matchName = !filterName || a.name === filterName;
    const matchCategory = !filterCategory || a.category === filterCategory;
    const matchBranch = !filterBranch || a.branchId === filterBranch;
    const matchStatus = !filterStatus || a.status === filterStatus;
    return matchSearch && matchName && matchCategory && matchBranch && matchStatus;
  });

  const hasFilter = search || filterName || filterCategory || filterBranch || filterStatus;

  function resetFilters() {
    setSearch("");
    setFilterName("");
    setFilterCategory("");
    setFilterBranch("");
    setFilterStatus("");
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      {/* 필터 영역 */}
      <div className="p-4 border-b border-gray-100 space-y-3">
        {/* 검색창 */}
        <input
          type="text"
          placeholder="자산번호 또는 품명 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        {/* 드롭다운 필터 */}
        <div className="flex flex-wrap gap-2">
          <select
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="">전체 품목</option>
            {uniqueNames.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="">전체 카테고리</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
          <select
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="">전체 지사</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="">전체 상태</option>
            {["사용중", "보관중", "수리중", "폐기"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {hasFilter && (
            <button
              onClick={resetFilters}
              className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1.5 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              필터 초기화
            </button>
          )}
          <span className="ml-auto text-xs text-gray-400 self-center">
            {filtered.length}개 / 전체 {assets.length}개
          </span>
        </div>
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-500">자산번호</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">품명</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">카테고리</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">지사</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">상태</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">구매일</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">비고</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500">관리</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-10 text-gray-400 text-sm">
                  {hasFilter ? "검색 결과가 없습니다." : "등록된 자산이 없습니다."}
                </td>
              </tr>
            ) : (
              filtered.map((asset) => (
                <tr key={asset.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-blue-700 font-medium">{asset.assetNumber}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    <Link href={`/assets/${asset.id}`} className="hover:underline text-blue-600">
                      {asset.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{asset.category}</td>
                  <td className="px-4 py-3 text-gray-600">{getBranchName(asset.branchId)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_COLORS[asset.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {asset.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{asset.purchaseDate}</td>
                  <td className="px-4 py-3 text-gray-400 max-w-32 truncate">{asset.note || "-"}</td>
                  <td className="px-4 py-3 text-right">
                    {confirmDeleteId === asset.id ? (
                      <span className="inline-flex items-center gap-2">
                        <button
                          onClick={() => { deleteAsset(asset.id); setConfirmDeleteId(null); }}
                          className="text-xs text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded transition-colors"
                        >삭제</button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >취소</button>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-3">
                        <Link href={`/assets/${asset.id}/edit`} className="text-xs text-blue-600 hover:underline">수정</Link>
                        <button
                          onClick={() => setConfirmDeleteId(asset.id)}
                          className="text-xs text-red-400 hover:underline"
                        >삭제</button>
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
