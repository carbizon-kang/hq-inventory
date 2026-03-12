"use client";

import Link from "next/link";
import Header from "@/components/layout/Header";
import StatCard from "@/components/ui/StatCard";
import AssetTable from "@/components/assets/AssetTable";
import { useAssets } from "@/lib/assetStore";
import { useBranches } from "@/lib/branchStore";
import { useAuth } from "@/lib/authStore";

export default function AssetsPage() {
  const { assets } = useAssets();
  const { branches } = useBranches();
  const { isAdmin, currentUser } = useAuth();

  // 부문 미지정(division="")이면 전체, 부문 지정이면 해당 부문만 표시
  const userDiv = currentUser?.division ?? "";
  const displayBranches = (isAdmin || userDiv === "")
    ? branches
    : branches.filter((b) => b.division === userDiv);
  const displayBranchIds = new Set(displayBranches.map((b) => b.id));
  const displayAssets = (isAdmin || userDiv === "") ? assets : assets.filter((a) => displayBranchIds.has(a.branchId));

  const total = displayAssets.length;
  const inUse = displayAssets.filter((a) => a.status === "사용중").length;
  const inStorage = displayAssets.filter((a) => a.status === "보관중").length;
  const inRepair = displayAssets.filter((a) => a.status === "수리중" || a.status === "폐기").length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">유형자산 관리</h1>
            <p className="text-sm text-gray-500 mt-1">노트북·모니터·책상 등 개별 자산 등록, 라벨링, 지사 이동 이력 관리</p>
          </div>
          {isAdmin && (
            <Link
              href="/assets/new"
              className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              + 자산 등록
            </Link>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard title="전체 자산" value={total} sub="등록된 자산 합계" color="blue" />
          <StatCard title="사용중" value={inUse} sub="현재 사용 중" color="green" />
          <StatCard title="보관중" value={inStorage} sub="미배치 자산" color="yellow" />
          <StatCard title="수리/폐기" value={inRepair} sub="점검 필요" color="red" />
        </div>

        <AssetTable assets={displayAssets} branches={displayBranches} isAdmin={isAdmin} />
      </main>
    </div>
  );
}
