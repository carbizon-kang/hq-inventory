"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import StatCard from "@/components/ui/StatCard";
import { useAssets } from "@/lib/assetStore";
import { useBranches } from "@/lib/branchStore";

const STATUS_COLORS: Record<string, string> = {
  "사용중": "bg-green-100 text-green-700",
  "보관중": "bg-blue-100 text-blue-700",
  "수리중": "bg-yellow-100 text-yellow-700",
  "폐기": "bg-red-100 text-red-700",
};

export default function BranchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { assets } = useAssets();
  const { branches } = useBranches();

  const branch = branches.find((b) => b.id === id);
  if (!branch) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <p className="text-gray-500">존재하지 않는 지사입니다.</p>
        </main>
      </div>
    );
  }

  const branchAssets = assets.filter((a) => a.branchId === id);
  const total = branchAssets.length;
  const inUse = branchAssets.filter((a) => a.status === "사용중").length;
  const inStorage = branchAssets.filter((a) => a.status === "보관중").length;
  const inRepair = branchAssets.filter((a) => a.status === "수리중" || a.status === "폐기").length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/branches" className="text-sm text-blue-600 hover:underline mb-2 inline-block">
            ← 지사 목록으로
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{branch.name}</h1>
            <span className="text-sm text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
              {branch.location}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            담당자: <span className="font-medium text-gray-700">{branch.manager}</span>
            <span className="mx-2 text-gray-300">|</span>
            연락처: <span className="font-medium text-gray-700">{branch.contact}</span>
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard title="전체 자산" value={total} sub="보유 자산 합계" color="blue" />
          <StatCard title="사용중" value={inUse} sub="현재 사용 중" color="green" />
          <StatCard title="보관중" value={inStorage} sub="미배치 자산" color="blue" />
          <StatCard title="수리/폐기" value={inRepair} sub="점검 필요" color="red" />
        </div>

        {/* 자산 목록 */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-500">자산번호</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">품명</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">카테고리</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">상태</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">구매일</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">비고</th>
              </tr>
            </thead>
            <tbody>
              {branchAssets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-400">
                    이 지사에 등록된 자산이 없습니다.
                  </td>
                </tr>
              ) : (
                branchAssets.map((asset) => (
                  <tr key={asset.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-blue-700 font-medium">
                      <Link href={`/assets/${asset.id}`} className="hover:underline">
                        {asset.assetNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">{asset.name}</td>
                    <td className="px-4 py-3 text-gray-500">{asset.category}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_COLORS[asset.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{asset.purchaseDate}</td>
                    <td className="px-4 py-3 text-gray-400">{asset.note || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <p className="px-4 py-2 text-xs text-gray-400 border-t border-gray-50">
            총 {branchAssets.length}개 자산
          </p>
        </div>
      </main>
    </div>
  );
}
