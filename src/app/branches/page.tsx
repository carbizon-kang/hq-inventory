"use client";

import Header from "@/components/layout/Header";
import BranchCard from "@/components/branches/BranchCard";
import StatCard from "@/components/ui/StatCard";
import { MOCK_BRANCHES } from "@/lib/mockData";
import { getLowStockItems, getStockStatus } from "@/lib/inventory";
import { useInventory } from "@/lib/inventoryStore";

export default function BranchesPage() {
  const { items } = useInventory();

  const totalBranches = MOCK_BRANCHES.length;
  const allLow = getLowStockItems(items);
  const allDanger = items.filter((i) => getStockStatus(i) === "위험");
  const branchesWithIssue = new Set(allLow.map((i) => i.branchId)).size;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">지사 관리</h1>
          <p className="text-sm text-gray-500 mt-1">지사별 재고 현황 및 담당자 정보</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard title="전체 지사" value={totalBranches} sub="본사 포함" color="blue" />
          <StatCard title="정상 지사" value={totalBranches - branchesWithIssue} sub="재고 이상 없음" color="green" />
          <StatCard title="주의 지사" value={branchesWithIssue} sub="부족 재고 보유" color="yellow" />
          <StatCard title="위험 품목" value={allDanger.length} sub="전 지사 합계" color="red" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_BRANCHES.map((branch) => (
            <BranchCard key={branch.id} branch={branch} items={items} />
          ))}
        </div>
      </main>
    </div>
  );
}
