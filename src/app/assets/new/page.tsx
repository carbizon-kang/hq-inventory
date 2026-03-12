"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import AssetForm from "@/components/assets/AssetForm";
import { useAuth } from "@/lib/authStore";

export default function NewAssetPage() {
  const { isAdmin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAdmin) router.replace("/assets");
  }, [isAdmin, isLoading, router]);

  if (isLoading || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/assets" className="text-sm text-blue-600 hover:underline mb-2 inline-block">
            ← 자산 목록으로
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">유형자산 등록</h1>
          <p className="text-sm text-gray-500 mt-1">새 유형자산을 등록하고 자산번호를 부여합니다.</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <AssetForm />
        </div>
      </main>
    </div>
  );
}
