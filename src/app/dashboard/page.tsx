"use client";

import Header from "@/components/layout/Header";
import StatCard from "@/components/ui/StatCard";
import StockBadge from "@/components/ui/StockBadge";
import { MOCK_BRANCHES } from "@/lib/mockData";
import { getLowStockItems, getStockStatus, getBranchSummary } from "@/lib/inventory";
import { useInventory } from "@/lib/inventoryStore";

export default function DashboardPage() {
  const { items } = useInventory();

  const totalItems = items.length;
  const lowStockItems = getLowStockItems(items);
  const dangerItems = items.filter((item) => getStockStatus(item) === "위험");
  const branchCount = MOCK_BRANCHES.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 페이지 제목 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
          <p className="text-sm text-gray-500 mt-1">2026년 3월 5일 기준 전체 재고 현황</p>
        </div>

        {/* 요약 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard title="전체 재고 품목" value={totalItems} sub="전 지사 합계" color="blue" />
          <StatCard title="관리 지사" value={branchCount} sub="본사 포함" color="green" />
          <StatCard title="부족 재고" value={lowStockItems.length} sub="주의 및 위험 포함" color="yellow" />
          <StatCard title="위험 재고" value={dangerItems.length} sub="즉시 보충 필요" color="red" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 부족 재고 목록 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-800">부족 재고 현황</h2>
              <p className="text-xs text-gray-400 mt-0.5">최소 재고 기준 미달 품목</p>
            </div>
            <div className="divide-y divide-gray-50">
              {lowStockItems.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">부족 재고 없음</p>
              ) : (
                lowStockItems.map((item) => {
                  const branch = MOCK_BRANCHES.find((b) => b.id === item.branchId);
                  const status = getStockStatus(item);
                  return (
                    <div key={item.id} className="px-5 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{item.name}</p>
                        <p className="text-xs text-gray-400">
                          {branch?.name} · {item.category}
                        </p>
                      </div>
                      <div className="text-right">
                        <StockBadge status={status} />
                        <p className="text-xs text-gray-500 mt-1">
                          {item.quantity} / {item.minimumStock} {item.unit}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 지사별 재고 현황 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-800">지사별 재고 현황</h2>
              <p className="text-xs text-gray-400 mt-0.5">지사별 품목 수 및 부족 재고</p>
            </div>
            <div className="divide-y divide-gray-50">
              {MOCK_BRANCHES.map((branch) => {
                const { total, lowStock } = getBranchSummary(items, branch.id);
                const ratio = total > 0 ? Math.round(((total - lowStock) / total) * 100) : 100;
                return (
                  <div key={branch.id} className="px-5 py-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <div>
                        <span className="text-sm font-medium text-gray-800">{branch.name}</span>
                        <span className="text-xs text-gray-400 ml-2">{branch.location}</span>
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        {lowStock > 0 ? (
                          <span className="text-yellow-600 font-medium">부족 {lowStock}건</span>
                        ) : (
                          <span className="text-green-600 font-medium">정상</span>
                        )}
                        <span className="ml-2">총 {total}품목</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          ratio >= 80 ? "bg-green-400" : ratio >= 50 ? "bg-yellow-400" : "bg-red-400"
                        }`}
                        style={{ width: `${ratio}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
