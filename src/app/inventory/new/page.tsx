import Link from "next/link";
import Header from "@/components/layout/Header";
import InventoryForm from "@/components/inventory/InventoryForm";

export default function NewInventoryPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/inventory" className="text-sm text-blue-600 hover:underline mb-2 inline-block">
            ← 재고 현황으로
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">재고 추가</h1>
          <p className="text-sm text-gray-500 mt-1">새로운 재고 품목을 등록합니다.</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <InventoryForm />
        </div>
      </main>
    </div>
  );
}
