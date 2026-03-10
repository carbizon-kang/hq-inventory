"use client";

import { use } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import RentalForm from "@/components/rentals/RentalForm";
import { useRentals } from "@/lib/rentalStore";

export default function EditRentalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { rentals } = useRentals();
  const rental = rentals.find((r) => r.id === id);

  if (!rental) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-8">
          <p className="text-gray-400">렌트 정보를 찾을 수 없습니다.</p>
          <Link href="/rentals" className="text-sm text-blue-600 hover:underline mt-2 inline-block">← 렌트 현황으로</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href={`/rentals/${id}`} className="text-sm text-blue-600 hover:underline mb-2 inline-block">
            ← 상세로 돌아가기
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">렌트 정보 수정</h1>
          <p className="text-sm text-gray-500 mt-1">{rental.modelName || rental.equipType} 렌트 정보를 수정합니다.</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <RentalForm initial={rental} />
        </div>
      </main>
    </div>
  );
}
