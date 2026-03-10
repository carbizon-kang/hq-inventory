"use client";

import Link from "next/link";
import Header from "@/components/layout/Header";
import StatCard from "@/components/ui/StatCard";
import RentalTable from "@/components/rentals/RentalTable";
import { useRentals } from "@/lib/rentalStore";
import { useBranches } from "@/lib/branchStore";

export default function RentalsPage() {
  const { rentals } = useRentals();
  const { branches } = useBranches();

  const active      = rentals.filter((r) => r.status === "렌트중").length;
  const copiers     = rentals.filter((r) => r.equipType === "복합기").length;
  const purifiers   = rentals.filter((r) => r.equipType === "정수기").length;
  const totalFee    = rentals
    .filter((r) => r.status === "렌트중")
    .reduce((sum, r) => sum + r.monthlyFee, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">렌트 현황</h1>
            <p className="text-sm text-gray-500 mt-1">복합기·정수기 등 렌트 장비 현황 및 비용 관리</p>
          </div>
          <Link
            href="/rentals/new"
            className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + 렌트 등록
          </Link>
        </div>

        {/* 요약 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard title="렌트중" value={active} sub="현재 계약 중인 건수" color="green" />
          <StatCard title="월 렌트 합계" value={`${totalFee.toLocaleString()}원`} sub="렌트중 장비 합산" color="blue" />
          <StatCard title="복합기" value={copiers} sub="전체 복합기 건수" color="yellow" />
          <StatCard title="정수기" value={purifiers} sub="전체 정수기 건수" color="blue" />
        </div>

        <RentalTable rentals={rentals} branches={branches} />
      </main>
    </div>
  );
}
