"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import BranchCard from "@/components/branches/BranchCard";
import StatCard from "@/components/ui/StatCard";
import { useBranches } from "@/lib/branchStore";
import { useAssets } from "@/lib/assetStore";

export default function BranchesPage() {
  const { branches } = useBranches();
  const { assets } = useAssets();
  const [search,       setSearch]       = useState("");
  const [filterDiv,    setFilterDiv]    = useState("");
  const [filterHQ,     setFilterHQ]     = useState("");
  const [filterTeam,   setFilterTeam]   = useState("");
  const [filterBranch, setFilterBranch] = useState("");

  const totalBranches = branches.length;
  const totalAssets   = assets.length;
  const inUse         = assets.filter((a) => a.status === "사용중").length;
  const inRepair      = assets.filter((a) => a.status === "수리중" || a.status === "폐기").length;

  // 연계 필터 옵션 계산
  const divOptions = Array.from(new Set(branches.map((b) => b.division).filter(Boolean))).sort();

  const hqOptions = Array.from(new Set(
    branches.filter((b) => !filterDiv || b.division === filterDiv)
            .map((b) => b.headquarters).filter(Boolean)
  )).sort();

  const teamOptions = Array.from(new Set(
    branches.filter((b) =>
      (!filterDiv || b.division === filterDiv) &&
      (!filterHQ  || b.headquarters === filterHQ)
    ).map((b) => b.team).filter(Boolean)
  )).sort();

  const branchOptions = [...branches]
    .filter((b) =>
      (!filterDiv  || b.division     === filterDiv) &&
      (!filterHQ   || b.headquarters === filterHQ)  &&
      (!filterTeam || b.team         === filterTeam)
    )
    .sort((a, b) => a.name.localeCompare(b.name, "ko"));

  // 최종 필터
  const filtered = branches.filter((b) => {
    const matchSearch =
      !search ||
      b.name.includes(search) ||
      b.location.includes(search) ||
      b.manager.includes(search) ||
      b.division.includes(search) ||
      b.headquarters.includes(search) ||
      b.team.includes(search);
    const matchDiv    = !filterDiv    || b.division     === filterDiv;
    const matchHQ     = !filterHQ     || b.headquarters === filterHQ;
    const matchTeam   = !filterTeam   || b.team         === filterTeam;
    const matchBranch = !filterBranch || b.id           === filterBranch;
    return matchSearch && matchDiv && matchHQ && matchTeam && matchBranch;
  });

  const hasFilter = search || filterDiv || filterHQ || filterTeam || filterBranch;

  function resetFilters() {
    setSearch(""); setFilterDiv(""); setFilterHQ(""); setFilterTeam(""); setFilterBranch("");
  }

  // 상위 필터 변경 시 하위 필터 초기화
  function handleDivChange(v: string) { setFilterDiv(v); setFilterHQ(""); setFilterTeam(""); setFilterBranch(""); }
  function handleHQChange(v: string)  { setFilterHQ(v);  setFilterTeam(""); setFilterBranch(""); }
  function handleTeamChange(v: string){ setFilterTeam(v); setFilterBranch(""); }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">지사 관리</h1>
            <p className="text-sm text-gray-500 mt-1">부문 › 본부 › 팀 › 사업장 계층 구조로 관리</p>
          </div>
          <Link href="/branches/new"
            className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >+ 지사 추가</Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard title="전체 지사" value={totalBranches} sub="본사 포함" color="blue" />
          <StatCard title="전체 자산" value={totalAssets}   sub="전 지사 합계" color="blue" />
          <StatCard title="사용중"   value={inUse}          sub="현재 사용 중" color="green" />
          <StatCard title="수리/폐기" value={inRepair}      sub="점검 필요" color="red" />
        </div>

        {/* ── 검색창 ── */}
        <div className="relative mb-3">
          <input
            type="text"
            placeholder="사업장명, 지역, 담당자, 부문, 본부, 팀으로 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm pl-9 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <svg className="absolute left-3 top-3 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          {search && (
            <button onClick={() => setSearch("")}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 text-lg leading-none"
            >×</button>
          )}
        </div>

        {/* ── 계층 필터 (부문→본부→팀→사업장 연계) ── */}
        <div className="bg-white border border-gray-100 rounded-xl p-3 mb-4 flex flex-wrap gap-2 items-center">
          {/* 부문 */}
          <select value={filterDiv} onChange={(e) => handleDivChange(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
          >
            <option value="">전체 부문</option>
            {divOptions.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>

          <span className="text-gray-300 text-sm">›</span>

          {/* 본부 */}
          <select value={filterHQ} onChange={(e) => handleHQChange(e.target.value)}
            disabled={!filterDiv && hqOptions.length === 0}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white disabled:opacity-40"
          >
            <option value="">전체 본부</option>
            {hqOptions.map((h) => <option key={h} value={h}>{h}</option>)}
          </select>

          <span className="text-gray-300 text-sm">›</span>

          {/* 팀 */}
          <select value={filterTeam} onChange={(e) => handleTeamChange(e.target.value)}
            disabled={!filterHQ && teamOptions.length === 0}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white disabled:opacity-40"
          >
            <option value="">전체 팀</option>
            {teamOptions.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>

          <span className="text-gray-300 text-sm">›</span>

          {/* 사업장 */}
          <select value={filterBranch} onChange={(e) => setFilterBranch(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
          >
            <option value="">전체 사업장</option>
            {branchOptions.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>

          {hasFilter && (
            <>
              <button onClick={resetFilters}
                className="text-xs text-gray-400 hover:text-gray-600 px-3 py-1.5 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >초기화</button>
              <span className="text-xs text-gray-400 ml-auto">
                {filtered.length}개 / 전체 {branches.length}개
              </span>
            </>
          )}
        </div>

        {/* ── 지사 목록 ── */}
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-12">
            {hasFilter ? "검색 결과가 없습니다." : "등록된 지사가 없습니다."}
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((branch) => (
              <BranchCard key={branch.id} branch={branch} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
