"use client";

import Header from "@/components/layout/Header";
import StatCard from "@/components/ui/StatCard";
import InventoryTable from "@/components/inventory/InventoryTable";
import { MOCK_BRANCHES } from "@/lib/mockData";
import { getStockStatus } from "@/lib/inventory";
import { useInventory } from "@/lib/inventoryStore";

export default function InventoryPage() {
  const { items } = useInventory();

  const totalItems = items.length;
  const normalItems = items.filter((i) => getStockStatus(i) === "정상").length;
  const lowItems = items.filter((i) => getStockStatus(i) === "부족").length;
  const dangerItems = items.filter((i) => getStockStatus(i) === "위험").length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">재고 현황</h1>
          <p className="text-sm text-gray-500 mt-1">전 지사 재고 품목 조회 및 관리</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard title="전체 품목" value={totalItems} sub="전 지사 합계" color="blue" />
          <StatCard title="정상" value={normalItems} sub="기준 재고 이상" color="green" />
          <StatCard title="부족" value={lowItems} sub="최소 재고 50% 이하" color="yellow" />
          <StatCard title="위험" value={dangerItems} sub="최소 재고 20% 이하" color="red" />
        </div>

        <InventoryTable items={items} branches={MOCK_BRANCHES} />
      </main>
    </div>
  );
}
