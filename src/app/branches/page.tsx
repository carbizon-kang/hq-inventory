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
  const [search, setSearch] = useState("");

  const totalBranches = branches.length;
  const totalAssets = assets.length;
  const inUse = assets.filter((a) => a.status === "사용중").length;
  const inRepair = assets.filter((a) => a.status === "수리중" || a.status === "폐기").length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">지사 관리</h1>
            <p className="text-sm text-gray-500 mt-1">지사별 자산 현황 및 담당자 정보</p>
          </div>
          <Link
            href="/branches/new"
            className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + 지사 추가
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard title="전체 지사" value={totalBranches} sub="본사 포함" color="blue" />
          <StatCard title="전체 자산" value={totalAssets} sub="전 지사 합계" color="blue" />
          <StatCard title="사용중" value={inUse} sub="현재 사용 중" color="green" />
          <StatCard title="수리/폐기" value={inRepair} sub="점검 필요" color="red" />
        </div>

        {/* 검색창 */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="지사명 또는 지역으로 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm pl-9 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <svg className="absolute left-3 top-3 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 text-lg leading-none"
            >×</button>
          )}
        </div>

        {/* 지사 목록 */}
        {(() => {
          const filtered = branches.filter((b) =>
            !search ||
            b.name.includes(search) ||
            (b.address ?? "").includes(search) ||
            (b.manager ?? "").includes(search)
          );
          return filtered.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-12">
              {search ? `"${search}" 검색 결과가 없습니다.` : "등록된 지사가 없습니다."}
            </p>
          ) : (
            <>
              {search && (
                <p className="text-xs text-gray-400 mb-2">{filtered.length}개 / 전체 {branches.length}개</p>
              )}
              <div className="flex flex-col gap-3">
                {filtered.map((branch) => (
                  <BranchCard key={branch.id} branch={branch} />
                ))}
              </div>
            </>
          );
        })()}
      </main>
    </div>
  );
}
