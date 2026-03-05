"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import StatCard from "@/components/ui/StatCard";
import InventoryTable from "@/components/inventory/InventoryTable";
import { MOCK_BRANCHES } from "@/lib/mockData";
import { getStockStatus } from "@/lib/inventory";
import { useInventory } from "@/lib/inventoryStore";

export default function BranchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { items } = useInventory();

  const branch = MOCK_BRANCHES.find((b) => b.id === id);
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

  const branchItems = items.filter((i) => i.branchId === id);
  const normalCount = branchItems.filter((i) => getStockStatus(i) === "정상").length;
  const lowCount = branchItems.filter((i) => getStockStatus(i) === "부족").length;
  const dangerCount = branchItems.filter((i) => getStockStatus(i) === "위험").length;

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
          <StatCard title="전체 품목" value={branchItems.length} sub="관리 중인 품목" color="blue" />
          <StatCard title="정상" value={normalCount} sub="기준 재고 이상" color="green" />
          <StatCard title="부족" value={lowCount} sub="최소 재고 50% 이하" color="yellow" />
          <StatCard title="위험" value={dangerCount} sub="즉시 보충 필요" color="red" />
        </div>

        <InventoryTable items={branchItems} branches={MOCK_BRANCHES} hideBranchFilter />
      </main>
    </div>
  );
}
