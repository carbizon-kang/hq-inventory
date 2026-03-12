"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import StatCard from "@/components/ui/StatCard";
import { useAssets } from "@/lib/assetStore";
import { useBranches } from "@/lib/branchStore";
import { useAuth } from "@/lib/authStore";
import { useOrg } from "@/lib/orgStore";
import { Asset } from "@/types";

// 부문별 합계
interface DivisionSummary {
  divName: string;
  total: number;
  inUse: number;
  inStorage: number;
  inRepair: number;
}

// 품목별 그룹 (본부 컬럼 포함)
interface AssetGroup {
  name: string;
  category: string;
  total: number;
  inUse: number;
  inStorage: number;
  inRepair: number;
  byHQ: Record<string, number>;
}

function buildDivisionSummaries(
  assets: Asset[],
  branchDivMap: Record<string, string>,
  divNames: string[]
): DivisionSummary[] {
  const map: Record<string, DivisionSummary> = {};
  for (const d of divNames) {
    map[d] = { divName: d, total: 0, inUse: 0, inStorage: 0, inRepair: 0 };
  }
  for (const a of assets) {
    const div = branchDivMap[a.branchId] || "미분류";
    if (!map[div]) map[div] = { divName: div, total: 0, inUse: 0, inStorage: 0, inRepair: 0 };
    map[div].total++;
    if (a.status === "사용중") map[div].inUse++;
    else if (a.status === "보관중") map[div].inStorage++;
    else map[div].inRepair++;
  }
  return Object.values(map).filter((d) => d.total > 0);
}

function groupAssets(assets: Asset[], branchHQMap: Record<string, string>): AssetGroup[] {
  const map: Record<string, AssetGroup> = {};
  for (const a of assets) {
    const key = `${a.name}__${a.category}`;
    if (!map[key]) {
      map[key] = { name: a.name, category: a.category, total: 0, inUse: 0, inStorage: 0, inRepair: 0, byHQ: {} };
    }
    map[key].total++;
    if (a.status === "사용중") map[key].inUse++;
    else if (a.status === "보관중") map[key].inStorage++;
    else map[key].inRepair++;
    const hq = branchHQMap[a.branchId] || "미분류";
    map[key].byHQ[hq] = (map[key].byHQ[hq] || 0) + 1;
  }
  return Object.values(map).sort((a, b) =>
    a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
  );
}

export default function InventoryPage() {
  const { assets } = useAssets();
  const { branches } = useBranches();
  const { isAdmin, currentUser } = useAuth();
  const { divisions } = useOrg();

  const [selectedDiv, setSelectedDiv] = useState<string | null>(null);

  // 접근 가능한 지사 범위
  const scopeBranches = isAdmin
    ? branches
    : branches.filter((b) => b.division === currentUser?.division);
  const scopeBranchIds = new Set(scopeBranches.map((b) => b.id));
  const scopeAssets = isAdmin ? assets : assets.filter((a) => scopeBranchIds.has(a.branchId));

  // 지사 id → 부문명 / 본부명 매핑
  const branchDivMap: Record<string, string> = {};
  const branchHQMap: Record<string, string> = {};
  for (const b of scopeBranches) {
    branchDivMap[b.id] = b.division || "미분류";
    branchHQMap[b.id] = b.headquarters || "미분류";
  }

  // 부문 이름 목록 (org에 등록된 부문 + 미분류)
  const divNames = divisions.map((d) => d.name);
  const summaries = buildDivisionSummaries(scopeAssets, branchDivMap, divNames);

  // 선택된 부문의 상세 데이터
  const detailBranches = scopeBranches.filter((b) => (b.division || "미분류") === selectedDiv);
  const detailBranchIds = new Set(detailBranches.map((b) => b.id));
  const detailAssets = scopeAssets.filter((a) => detailBranchIds.has(a.branchId));
  const detailHQMap: Record<string, string> = {};
  for (const b of detailBranches) {
    detailHQMap[b.id] = b.headquarters || "미분류";
  }
  const hqColumns = Array.from(new Set(detailBranches.map((b) => b.headquarters || "미분류")));
  const groups = groupAssets(detailAssets, detailHQMap);

  // 전체 통계
  const scopeStats = selectedDiv
    ? { total: detailAssets.length, inUse: detailAssets.filter((a) => a.status === "사용중").length, inStorage: detailAssets.filter((a) => a.status === "보관중").length, inRepair: detailAssets.filter((a) => a.status === "수리중" || a.status === "폐기").length }
    : { total: scopeAssets.length, inUse: scopeAssets.filter((a) => a.status === "사용중").length, inStorage: scopeAssets.filter((a) => a.status === "보관중").length, inRepair: scopeAssets.filter((a) => a.status === "수리중" || a.status === "폐기").length };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 제목 / 브레드크럼 */}
        <div className="flex items-center gap-3 mb-6">
          {selectedDiv ? (
            <>
              <button
                onClick={() => setSelectedDiv(null)}
                className="text-sm text-blue-600 hover:underline"
              >
                ← 부문 전체
              </button>
              <span className="text-gray-300">/</span>
              <h1 className="text-2xl font-bold text-gray-900">{selectedDiv}</h1>
            </>
          ) : (
            <div>
              <h1 className="text-2xl font-bold text-gray-900">자산 현황</h1>
              <p className="text-sm text-gray-500 mt-1">부문별 자산 보유 현황 — 부문을 클릭하면 상세 현황을 확인합니다.</p>
            </div>
          )}
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard title="전체 자산" value={scopeStats.total} sub="등록된 자산 합계" color="blue" />
          <StatCard title="사용중" value={scopeStats.inUse} sub="현재 사용 중" color="green" />
          <StatCard title="보관중" value={scopeStats.inStorage} sub="미배치 자산" color="yellow" />
          <StatCard title="수리/폐기" value={scopeStats.inRepair} sub="점검 필요" color="red" />
        </div>

        {/* 부문 합계 화면 */}
        {!selectedDiv && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">부문</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">전체</th>
                  <th className="text-center px-4 py-3 font-medium text-green-600">사용중</th>
                  <th className="text-center px-4 py-3 font-medium text-blue-500">보관중</th>
                  <th className="text-center px-4 py-3 font-medium text-yellow-500">수리/폐기</th>
                </tr>
              </thead>
              <tbody>
                {summaries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-gray-400">
                      등록된 자산이 없습니다.
                    </td>
                  </tr>
                ) : (
                  summaries.map((s) => (
                    <tr
                      key={s.divName}
                      onClick={() => setSelectedDiv(s.divName)}
                      className="border-b border-gray-50 hover:bg-blue-50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 font-semibold text-blue-700 flex items-center gap-1">
                        {s.divName}
                        <span className="text-xs text-gray-400 font-normal ml-1">클릭하여 상세 보기</span>
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-gray-800">{s.total}</td>
                      <td className="px-4 py-3 text-center text-green-600 font-medium">{s.inUse || <span className="text-gray-300">-</span>}</td>
                      <td className="px-4 py-3 text-center text-blue-500 font-medium">{s.inStorage || <span className="text-gray-300">-</span>}</td>
                      <td className="px-4 py-3 text-center text-yellow-500 font-medium">{s.inRepair || <span className="text-gray-300">-</span>}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 부문 상세 화면 */}
        {selectedDiv && (
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
                  {hqColumns.map((hq) => (
                    <th key={hq} className="text-center px-3 py-3 font-medium text-gray-400 whitespace-nowrap">
                      {hq}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {groups.length === 0 ? (
                  <tr>
                    <td colSpan={6 + hqColumns.length} className="text-center py-12 text-gray-400">
                      해당 부문에 등록된 자산이 없습니다.
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
                      {hqColumns.map((hq) => (
                        <td key={hq} className="px-3 py-3 text-center">
                          {g.byHQ[hq] ? (
                            <span className="inline-block bg-blue-50 text-blue-700 rounded px-1.5 py-0.5 text-xs font-medium">
                              {g.byHQ[hq]}대
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
              * 수량은 유형자산 등록/삭제 시 자동으로 반영됩니다.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
