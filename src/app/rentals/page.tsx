"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import StatCard from "@/components/ui/StatCard";
import RentalTable from "@/components/rentals/RentalTable";
import RentalForm from "@/components/rentals/RentalForm";
import { useRentals } from "@/lib/rentalStore";
import { useBranches } from "@/lib/branchStore";
import { useAuth } from "@/lib/authStore";

export default function RentalsPage() {
  const { rentals } = useRentals();
  const { branches } = useBranches();
  const { isAdmin, currentUser } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);

  // 부문 미지정(division="")이면 전체, 부문 지정이면 해당 부문만 표시
  const userDiv = currentUser?.division ?? "";
  const displayBranches = (isAdmin || userDiv === "")
    ? branches
    : branches.filter((b) => b.division === userDiv);
  const displayBranchIds = new Set(displayBranches.map((b) => b.id));
  const displayRentals = (isAdmin || userDiv === "") ? rentals : rentals.filter((r) => displayBranchIds.has(r.branchId));

  const active      = displayRentals.filter((r) => r.status === "렌트중").length;
  const copiers     = displayRentals.filter((r) => r.equipType === "복합기").length;
  const purifiers   = displayRentals.filter((r) => r.equipType === "정수기").length;
  const totalFee    = displayRentals
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
          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              + 렌트 등록
            </button>
          )}
        </div>

        {/* 요약 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard title="렌트중" value={active} sub="현재 계약 중인 건수" color="green" />
          <StatCard title="월 렌트 합계" value={`${totalFee.toLocaleString()}원`} sub="렌트중 장비 합산" color="blue" />
          <StatCard title="복합기" value={copiers} sub="전체 복합기 건수" color="yellow" />
          <StatCard title="정수기" value={purifiers} sub="전체 정수기 건수" color="blue" />
        </div>

        <RentalTable rentals={displayRentals} branches={displayBranches} isAdmin={isAdmin} />
      </main>

      {/* 렌트 등록 모달 */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={(e) => { if (e.target === e.currentTarget) setShowAddModal(false); }}
        >
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">렌트 등록</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-light leading-none"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <RentalForm onSuccess={() => setShowAddModal(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
