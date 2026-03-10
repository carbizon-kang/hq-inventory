"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import { useRentals } from "@/lib/rentalStore";
import { useBranches } from "@/lib/branchStore";

const STATUS_COLORS: Record<string, string> = {
  "렌트중": "bg-green-100 text-green-700",
  "만료":   "bg-yellow-100 text-yellow-700",
  "해지":   "bg-red-100 text-red-700",
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex py-3 border-b border-gray-50 last:border-0">
      <dt className="w-36 text-sm text-gray-500 shrink-0">{label}</dt>
      <dd className="text-sm text-gray-800 font-medium">{value}</dd>
    </div>
  );
}

export default function RentalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { rentals, deleteRental } = useRentals();
  const { branches } = useBranches();

  const rental = rentals.find((r) => r.id === id);
  const branchName = branches.find((b) => b.id === rental?.branchId)?.name ?? rental?.branchId ?? "-";

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

  async function handleDelete() {
    if (!confirm("이 렌트 정보를 삭제하시겠습니까?")) return;
    await deleteRental(rental!.id);
    router.push("/rentals");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/rentals" className="text-sm text-blue-600 hover:underline mb-2 inline-block">
            ← 렌트 현황으로
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              {rental.modelName || rental.equipType}
            </h1>
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${STATUS_COLORS[rental.status] ?? "bg-gray-100 text-gray-600"}`}>
              {rental.status}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-4">
          <dl>
            <Row label="지사"        value={branchName} />
            <Row label="장비 유형"   value={rental.equipType} />
            {rental.equipType === "정수기" && rental.waterPurifierType && (
              <Row label="정수기 유형" value={
                <span className="bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-full text-xs">{rental.waterPurifierType}</span>
              } />
            )}
            <Row label="모델명"      value={rental.modelName || "-"} />
            <Row label="렌탈 업체"   value={rental.vendor || "-"} />
            <Row label="월 렌트비"   value={rental.monthlyFee > 0 ? `${rental.monthlyFee.toLocaleString()}원` : "-"} />
            <Row label="렌트 시작일" value={rental.startDate} />
            <Row label="렌트 종료일" value={rental.endDate} />
            <Row label="보증금"      value={
              rental.deposit
                ? `있음${rental.depositAmount > 0 ? ` (${rental.depositAmount.toLocaleString()}원)` : ""}`
                : "없음"
            } />
            <Row label="상태"        value={rental.status} />
            <Row label="비고"        value={rental.note || "-"} />
          </dl>
        </div>

        <div className="flex gap-3">
          <Link
            href={`/rentals/${rental.id}/edit`}
            className="flex-1 text-center border border-blue-200 text-blue-600 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
          >
            수정
          </Link>
          <button
            onClick={handleDelete}
            className="flex-1 border border-red-200 text-red-500 py-2.5 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
          >
            삭제
          </button>
        </div>
      </main>
    </div>
  );
}
