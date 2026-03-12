"use client";

import Link from "next/link";
import Header from "@/components/layout/Header";
import BranchForm from "@/components/branches/BranchForm";

export default function NewBranchPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/branches" className="text-sm text-blue-600 hover:underline mb-2 inline-block">
            ← 지사 목록으로
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">지사 추가</h1>
          <p className="text-sm text-gray-500 mt-1">새 지사를 등록합니다.</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <BranchForm />
        </div>
      </main>
    </div>
  );
}
