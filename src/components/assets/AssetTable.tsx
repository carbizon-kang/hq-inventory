"use client";

import { useState } from "react";
import Link from "next/link";
import { Asset, Branch } from "@/types";
import { useAssets } from "@/lib/assetStore";
import { useCategories } from "@/lib/categoryStore";
import { useOrg } from "@/lib/orgStore";
import SearchSelect from "@/components/ui/SearchSelect";
import QRModal from "@/components/assets/QRModal";

const STATUS_COLORS: Record<string, string> = {
  "사용중": "bg-green-100 text-green-700",
  "보관중": "bg-blue-100 text-blue-700",
  "수리중": "bg-yellow-100 text-yellow-700",
  "폐기":   "bg-red-100 text-red-700",
};

interface AssetTableProps {
  assets: Asset[];
  branches: Branch[];
  isAdmin?: boolean;
}

export default function AssetTable({ assets, branches, isAdmin = false }: AssetTableProps) {
  const { deleteAsset } = useAssets();
  const { categories } = useCategories();
  const { divisions, getHQsByDivision, getTeamsByHQ } = useOrg();

  const [search, setSearch] = useState("");
  const [filterDiv,      setFilterDiv]      = useState("");
  const [filterHQ,       setFilterHQ]       = useState("");
  const [filterTeam,     setFilterTeam]     = useState("");
  const [filterName,     setFilterName]     = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterBranch,   setFilterBranch]   = useState("");
  const [filterStatus,   setFilterStatus]   = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [qrAsset, setQrAsset] = useState<Asset | null>(null);

  const getBranch = (id: string) => branches.find((b) => b.id === id);
  const getBranchName = (id: string) => getBranch(id)?.name ?? id;

  const hqOptions   = filterDiv ? getHQsByDivision(filterDiv) : [];
  const teamOptions = filterHQ  ? getTeamsByHQ(filterHQ)      : [];

  // 계층 필터에 해당하는 지사 ID 집합
  const filteredBranchIds = new Set(
    branches.filter((b) => {
      if (filterDiv  && b.division     !== filterDiv)  return false;
      if (filterHQ   && b.headquarters !== filterHQ)   return false;
      if (filterTeam && b.team         !== filterTeam) return false;
      return true;
    }).map((b) => b.id)
  );

  // 계층 필터 적용된 지사 목록 (지사 드롭다운용)
  const branchOptions = branches.filter((b) => {
    if (filterDiv  && b.division     !== filterDiv)  return false;
    if (filterHQ   && b.headquarters !== filterHQ)   return false;
    if (filterTeam && b.team         !== filterTeam) return false;
    return true;
  });

  function handleFilterDiv(v: string) {
    setFilterDiv(v); setFilterHQ(""); setFilterTeam(""); setFilterBranch("");
  }
  function handleFilterHQ(v: string) {
    setFilterHQ(v); setFilterTeam(""); setFilterBranch("");
  }

  const uniqueNames = Array.from(new Set(assets.map((a) => a.name))).sort();

  const filtered = assets.filter((a) => {
    const branch = getBranch(a.branchId);
    const matchSearch =
      !search ||
      a.name.includes(search) ||
      a.assetNumber.includes(search) ||
      (branch?.name ?? "").includes(search);
    const matchDiv      = !filterDiv      || filteredBranchIds.has(a.branchId);
    const matchHQ       = !filterHQ       || (branch?.headquarters === filterHQ);
    const matchTeam     = !filterTeam     || (branch?.team === filterTeam);
    const matchName     = !filterName     || a.name === filterName;
    const matchCategory = !filterCategory || a.category === filterCategory;
    const matchBranch   = !filterBranch   || a.branchId === filterBranch;
    const matchStatus   = !filterStatus   || a.status === filterStatus;
    return matchSearch && matchDiv && matchHQ && matchTeam && matchName && matchCategory && matchBranch && matchStatus;
  });

  const hasFilter = search || filterDiv || filterHQ || filterTeam || filterName || filterCategory || filterBranch || filterStatus;

  function resetFilters() {
    setSearch(""); setFilterDiv(""); setFilterHQ(""); setFilterTeam("");
    setFilterName(""); setFilterCategory(""); setFilterBranch(""); setFilterStatus("");
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">

        {/* ── 필터 영역 ── */}
        <div className="p-4 border-b border-gray-100 space-y-2">
          <input
            type="text"
            placeholder="자산번호, 품명, 지사명 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          {/* 계층 필터: 부문 → 본부 → 팀 → 지사 */}
          <div className="flex flex-wrap gap-2 items-center">
            {divisions.length > 0 && (
              <>
                <select
                  value={filterDiv}
                  onChange={(e) => handleFilterDiv(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                >
                  <option value="">전체 부문</option>
                  {divisions.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
                </select>
                <span className="text-gray-300 text-sm">›</span>
                <select
                  value={filterHQ}
                  onChange={(e) => handleFilterHQ(e.target.value)}
                  disabled={!filterDiv || hqOptions.length === 0}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white disabled:opacity-40"
                >
                  <option value="">전체 본부</option>
                  {hqOptions.map((h) => <option key={h.id} value={h.name}>{h.name}</option>)}
                </select>
                <span className="text-gray-300 text-sm">›</span>
                <select
                  value={filterTeam}
                  onChange={(e) => { setFilterTeam(e.target.value); setFilterBranch(""); }}
                  disabled={!filterHQ || teamOptions.length === 0}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white disabled:opacity-40"
                >
                  <option value="">전체 팀</option>
                  {teamOptions.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
                </select>
                <span className="text-gray-300 text-sm">›</span>
              </>
            )}
            <SearchSelect
              options={branchOptions.map((b) => ({ value: b.id, label: b.name }))}
              value={filterBranch}
              onChange={setFilterBranch}
              placeholder="지사 검색..."
              allLabel="전체 지사"
            />
          </div>
          {/* 품목/카테고리/상태 필터 */}
          <div className="flex flex-wrap gap-2 items-center">
            <SearchSelect
              options={uniqueNames.map((n) => ({ value: n, label: n }))}
              value={filterName}
              onChange={setFilterName}
              placeholder="품명 검색..."
              allLabel="전체 품목"
            />
            <SearchSelect
              options={categories.map((c) => ({ value: c.name, label: c.name }))}
              value={filterCategory}
              onChange={setFilterCategory}
              placeholder="카테고리..."
              allLabel="전체 카테고리"
            />
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
                className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1.5 border border-gray-200 rounded-lg"
              >필터 초기화</button>
            )}
            <span className="ml-auto text-xs text-gray-400 self-center">
              {filtered.length}개 / 전체 {assets.length}개
            </span>
          </div>
        </div>

        {/* ── 테이블 ── */}
        <table className="w-full text-sm table-fixed">
          <colgroup>
            {/* 자산(번호+품명) | 분류+상태 | 지사 | 구매일 | 관리 */}
            <col className="w-[28%]" />
            <col className="w-[18%]" />
            <col className="w-[22%]" />
            <col className="w-[12%]" />
            <col className="w-[20%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-xs font-medium text-gray-500">
              <th className="text-left px-3 py-2.5">자산번호 / 품명</th>
              <th className="text-left px-3 py-2.5">카테고리 / 상태</th>
              <th className="text-left px-3 py-2.5">지사</th>
              <th className="text-left px-3 py-2.5">구매일</th>
              <th className="text-right px-3 py-2.5">관리</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-400 text-sm">
                  {hasFilter ? "검색 결과가 없습니다." : "등록된 자산이 없습니다."}
                </td>
              </tr>
            ) : (
              filtered.map((asset) => {
                const branchName = getBranchName(asset.branchId);
                return (
                  <tr key={asset.id} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">

                    {/* 자산번호 + 품명 */}
                    <td className="px-3 py-2">
                      <Link href={`/assets/${asset.id}`} className="block group">
                        <p className="font-medium text-gray-800 group-hover:text-blue-600 truncate">{asset.name}</p>
                        <p className="text-xs font-mono text-blue-500 mt-0.5">{asset.assetNumber}</p>
                      </Link>
                    </td>

                    {/* 카테고리 + 상태 */}
                    <td className="px-3 py-2">
                      <p className="text-xs text-gray-500 truncate">{asset.category}</p>
                      <span className={`inline-block mt-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full ${STATUS_COLORS[asset.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {asset.status}
                      </span>
                    </td>

                    {/* 지사 (말줄임 + hover 툴팁) */}
                    <td className="px-3 py-2">
                      <span
                        className="block text-gray-700 text-xs truncate"
                        title={branchName}
                      >
                        {branchName}
                      </span>
                    </td>

                    {/* 구매일 */}
                    <td className="px-3 py-2 text-xs text-gray-400 whitespace-nowrap">
                      {asset.purchaseDate}
                    </td>

                    {/* 관리 */}
                    <td className="px-3 py-2 text-right">
                      {isAdmin && confirmDeleteId === asset.id ? (
                        <span className="inline-flex items-center gap-1.5">
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
                        <span className="inline-flex items-center gap-2">
                          <button
                            onClick={() => setQrAsset(asset)}
                            className="text-xs text-gray-400 hover:text-gray-700"
                            title="QR 코드"
                          >QR</button>
                          {isAdmin && (
                            <>
                              <Link href={`/assets/${asset.id}/edit`} className="text-xs text-blue-600 hover:underline">수정</Link>
                              <button
                                onClick={() => setConfirmDeleteId(asset.id)}
                                className="text-xs text-red-400 hover:underline"
                              >삭제</button>
                            </>
                          )}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* QR 코드 모달 */}
      {qrAsset && (
        <QRModal
          assetId={qrAsset.id}
          assetNumber={qrAsset.assetNumber}
          assetName={qrAsset.name}
          branchName={getBranchName(qrAsset.branchId)}
          onClose={() => setQrAsset(null)}
        />
      )}
    </>
  );
}
