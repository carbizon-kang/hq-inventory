import Link from "next/link";
import Header from "@/components/layout/Header";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{APP_NAME}</h1>
          <p className="text-lg text-gray-600">{APP_DESCRIPTION}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/dashboard">
            <div className="bg-white rounded-xl shadow p-6 hover:shadow-md transition-shadow cursor-pointer border border-gray-100">
              <div className="text-blue-600 text-3xl mb-3">&#128202;</div>
              <h2 className="text-lg font-semibold text-gray-800 mb-1">대시보드</h2>
              <p className="text-sm text-gray-500">전체 재고 현황 및 통계를 한눈에 확인합니다.</p>
            </div>
          </Link>
          <Link href="/inventory">
            <div className="bg-white rounded-xl shadow p-6 hover:shadow-md transition-shadow cursor-pointer border border-gray-100">
              <div className="text-green-600 text-3xl mb-3">&#128230;</div>
              <h2 className="text-lg font-semibold text-gray-800 mb-1">재고 현황</h2>
              <p className="text-sm text-gray-500">품목별 재고 수량 및 입출고 내역을 관리합니다.</p>
            </div>
          </Link>
          <Link href="/branches">
            <div className="bg-white rounded-xl shadow p-6 hover:shadow-md transition-shadow cursor-pointer border border-gray-100">
              <div className="text-purple-600 text-3xl mb-3">&#127970;</div>
              <h2 className="text-lg font-semibold text-gray-800 mb-1">지사 관리</h2>
              <p className="text-sm text-gray-500">각 지사의 재고 현황을 개별적으로 확인합니다.</p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
