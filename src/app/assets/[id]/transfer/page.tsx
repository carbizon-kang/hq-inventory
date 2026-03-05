"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import TransferForm from "@/components/assets/TransferForm";
import { useAssets } from "@/lib/assetStore";

export default function TransferAssetPage() {
  const { id } = useParams<{ id: string }>();
  const { assets } = useAssets();
  const asset = assets.find((a) => a.id === id);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href={`/assets/${id}`} className="text-sm text-blue-600 hover:underline mb-2 inline-block">
            ← 자산 상세로
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">지사 이동</h1>
          {asset && (
            <p className="text-sm text-gray-500 mt-1">
              <span className="font-mono text-blue-600">{asset.assetNumber}</span> {asset.name} 자산을 이동합니다.
            </p>
          )}
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          {asset ? (
            <TransferForm asset={asset} />
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">존재하지 않는 자산입니다.</p>
          )}
        </div>
      </main>
    </div>
  );
}
