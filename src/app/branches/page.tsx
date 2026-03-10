"use client";

import Link from "next/link";
import Header from "@/components/layout/Header";
import BranchCard from "@/components/branches/BranchCard";
import StatCard from "@/components/ui/StatCard";
import { useBranches } from "@/lib/branchStore";
import { useAssets } from "@/lib/assetStore";

export default function BranchesPage() {
  const { branches } = useBranches();
  const { assets } = useAssets();

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

        <div className="flex flex-col gap-3">
          {branches.map((branch) => (
            <BranchCard key={branch.id} branch={branch} />
          ))}
        </div>
      </main>
    </div>
  );
}
