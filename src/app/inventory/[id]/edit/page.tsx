"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import InventoryForm from "@/components/inventory/InventoryForm";
import { useInventory } from "@/lib/inventoryStore";

export default function EditInventoryPage() {
  const { id } = useParams<{ id: string }>();
  const { items } = useInventory();
  const item = items.find((i) => i.id === id);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/inventory" className="text-sm text-blue-600 hover:underline mb-2 inline-block">
            ← 재고 현황으로
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">재고 수정</h1>
          <p className="text-sm text-gray-500 mt-1">재고 품목 정보를 수정합니다.</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          {item ? (
            <InventoryForm item={item} />
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">
              해당 품목을 찾을 수 없습니다.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
