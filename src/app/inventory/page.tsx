"use client";

import Header from "@/components/layout/Header";
import StatCard from "@/components/ui/StatCard";
import { useAssets } from "@/lib/assetStore";
import { useBranches } from "@/lib/branchStore";
import { useAuth } from "@/lib/authStore";
import { Asset } from "@/types";

interface AssetGroup {
  name: string;
  category: string;
  total: number;
  inUse: number;
  inStorage: number;
  inRepair: number;
  byBranch: Record<string, number>;
}

function groupAssets(assets: Asset[]): AssetGroup[] {
  const map: Record<string, AssetGroup> = {};
  for (const a of assets) {
    const key = `${a.name}__${a.category}`;
    if (!map[key]) {
      map[key] = { name: a.name, category: a.category, total: 0, inUse: 0, inStorage: 0, inRepair: 0, byBranch: {} };
    }
    map[key].total++;
    if (a.status === "사용중") map[key].inUse++;
    else if (a.status === "보관중") map[key].inStorage++;
    else map[key].inRepair++;
    map[key].byBranch[a.branchId] = (map[key].byBranch[a.branchId] || 0) + 1;
  }
  return Object.values(map).sort((a, b) =>
    a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
  );
}

export default function InventoryPage() {
  const { assets } = useAssets();
  const { branches } = useBranches();
  const { isAdmin, currentUser } = useAuth();

  // 일반 사용자는 자신의 지사 자산만 표시
  const displayAssets = isAdmin ? assets : assets.filter((a) => a.branchId === currentUser?.branchId);
  const displayBranches = isAdmin ? branches : branches.filter((b) => b.id === currentUser?.branchId);

  const groups = groupAssets(displayAssets);
  const totalAssets = displayAssets.length;
  const totalKinds = groups.length;
  const inUse = displayAssets.filter((a) => a.status === "사용중").length;
  const inStorage = displayAssets.filter((a) => a.status === "보관중").length;
  const inRepair = displayAssets.filter((a) => a.status === "수리중" || a.status === "폐기").length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">자산 현황</h1>
          <p className="text-sm text-gray-500 mt-1">품목별·지사별 자산 보유 현황 — 유형자산 등록 시 자동 집계됩니다.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <StatCard title="전체 자산" value={totalAssets} sub="등록된 자산 합계" color="blue" />
          <StatCard title="품목 종류" value={totalKinds} sub="품명 기준" color="blue" />
          <StatCard title="보관중" value={inStorage} sub="미배치 자산" color="yellow" />
          <StatCard title="사용중" value={inUse} sub="현재 사용 중" color="green" />
          <StatCard title="수리/폐기" value={inRepair} sub="점검 필요" color="red" />
        </div>

        {/* 품목별 지사 위치 현황 */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-500">품명</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">카테고리</th>
                <th className="text-center px-3 py-3 font-medium text-gray-600">전체</th>
                <th className="text-center px-3 py-3 font-medium text-green-600">사용중</th>
                <th className="text-center px-3 py-3 font-medium text-blue-500">보관중</th>
                <th className="text-center px-3 py-3 font-medium text-yellow-500">수리/폐기</th>
                {displayBranches.map((b) => (
                  <th key={b.id} className="text-center px-3 py-3 font-medium text-gray-400 whitespace-nowrap">
                    {b.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {groups.length === 0 ? (
                <tr>
                  <td colSpan={6 + displayBranches.length} className="text-center py-12 text-gray-400">
                    등록된 자산이 없습니다. 유형자산 메뉴에서 자산을 등록해 주세요.
                  </td>
                </tr>
              ) : (
                groups.map((g) => (
                  <tr key={`${g.name}__${g.category}`} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800">{g.name}</td>
                    <td className="px-4 py-3 text-gray-500">{g.category}</td>
                    <td className="px-3 py-3 text-center font-bold text-gray-800">{g.total}</td>
                    <td className="px-3 py-3 text-center text-green-600 font-medium">{g.inUse || <span className="text-gray-200">-</span>}</td>
                    <td className="px-3 py-3 text-center text-blue-500 font-medium">{g.inStorage || <span className="text-gray-200">-</span>}</td>
                    <td className="px-3 py-3 text-center text-yellow-500 font-medium">{g.inRepair || <span className="text-gray-200">-</span>}</td>
                    {displayBranches.map((b) => (
                      <td key={b.id} className="px-3 py-3 text-center">
                        {g.byBranch[b.id] ? (
                          <span className="inline-block bg-blue-50 text-blue-700 rounded px-1.5 py-0.5 text-xs font-medium">
                            {g.byBranch[b.id]}대
                          </span>
                        ) : (
                          <span className="text-gray-200">-</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <p className="px-4 py-2 text-xs text-gray-400 border-t border-gray-50">
            * 수량은 유형자산 등록/삭제 시 자동으로 반영됩니다. 직접 수정은 유형자산 메뉴에서 가능합니다.
          </p>
        </div>
      </main>
    </div>
  );
}
