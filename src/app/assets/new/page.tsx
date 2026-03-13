"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import AssetForm from "@/components/assets/AssetForm";
import AssetBulkUpload from "@/components/assets/AssetBulkUpload";
import { useAuth } from "@/lib/authStore";

type Tab = "single" | "bulk";

export default function NewAssetPage() {
  const { isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("single");

  useEffect(() => {
    if (!isLoading && !isAdmin) router.replace("/assets");
  }, [isAdmin, isLoading, router]);

  if (isLoading || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/assets" className="text-sm text-blue-600 hover:underline mb-2 inline-block">
            ← 자산 목록으로
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">유형자산 등록</h1>
        </div>

        {/* 탭 */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
          <button
            onClick={() => setTab("single")}
            className={`px-5 py-2 text-sm font-medium rounded-lg transition-colors ${
              tab === "single"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            개별 등록
          </button>
          <button
            onClick={() => setTab("bulk")}
            className={`px-5 py-2 text-sm font-medium rounded-lg transition-colors ${
              tab === "bulk"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            엑셀 일괄 등록
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          {tab === "single" ? (
            <AssetForm />
          ) : (
            <AssetBulkUpload onCancel={() => setTab("single")} />
          )}
        </div>
      </main>
    </div>
  );
}
