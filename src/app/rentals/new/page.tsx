"use client";

import Link from "next/link";
import Header from "@/components/layout/Header";
import RentalForm from "@/components/rentals/RentalForm";

export default function NewRentalPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/rentals" className="text-sm text-blue-600 hover:underline mb-2 inline-block">
            ← 렌트 현황으로
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">렌트 등록</h1>
          <p className="text-sm text-gray-500 mt-1">새 렌트 장비를 등록합니다.</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <RentalForm />
        </div>
      </main>
    </div>
  );
}
