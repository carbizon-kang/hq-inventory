"use client";

import { useState } from "react";
import Link from "next/link";
import { RentalItem, Branch } from "@/types";
import { useRentals } from "@/lib/rentalStore";

const STATUS_COLORS: Record<string, string> = {
  "렌트중": "bg-green-100 text-green-700",
  "만료":   "bg-yellow-100 text-yellow-700",
  "해지":   "bg-red-100 text-red-700",
};

const EQUIP_COLORS: Record<string, string> = {
  "복합기": "bg-blue-100 text-blue-700",
  "정수기": "bg-cyan-100 text-cyan-700",
  "기타":   "bg-gray-100 text-gray-600",
};

interface RentalTableProps {
  rentals: RentalItem[];
  branches: Branch[];
}

function formatFee(n: number) {
  return n > 0 ? `${n.toLocaleString()}원` : "-";
}

export default function RentalTable({ rentals, branches }: RentalTableProps) {
  const { deleteRental } = useRentals();
  const [filterBranch, setFilterBranch] = useState("");
  const [filterEquip, setFilterEquip] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const getBranchName = (id: string) => branches.find((b) => b.id === id)?.name ?? id;

  const filtered = rentals.filter((r) => {
    const matchBranch = !filterBranch || r.branchId === filterBranch;
    const matchEquip  = !filterEquip  || r.equipType === filterEquip;
    const matchStatus = !filterStatus || r.status === filterStatus;
    return matchBranch && matchEquip && matchStatus;
  });

  const hasFilter = filterBranch || filterEquip || filterStatus;

  function resetFilters() {
    setFilterBranch("");
    setFilterEquip("");
    setFilterStatus("");
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      {/* 필터 */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="">전체 지사</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <select
            value={filterEquip}
            onChange={(e) => setFilterEquip(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="">전체 장비</option>
            {["복합기", "정수기", "기타"].map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="">전체 상태</option>
            {["렌트중", "만료", "해지"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {hasFilter && (
            <button
              onClick={resetFilters}
              className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1.5 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              필터 초기화
            </button>
          )}
          <span className="ml-auto text-xs text-gray-400 self-center">
            {filtered.length}건 / 전체 {rentals.length}건
          </span>
        </div>
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-500">지사</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">장비유형</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">모델명</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">업체</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">월렌트비</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">렌트기간</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">보증금</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">정수기유형</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">상태</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500">관리</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-10 text-gray-400 text-sm">
                  {hasFilter ? "검색 결과가 없습니다." : "등록된 렌트 현황이 없습니다."}
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-800 font-medium">{getBranchName(r.branchId)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${EQUIP_COLORS[r.equipType] ?? "bg-gray-100 text-gray-600"}`}>
                      {r.equipType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    <Link href={`/rentals/${r.id}`} className="hover:underline text-blue-600">
                      {r.modelName || "-"}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{r.vendor || "-"}</td>
                  <td className="px-4 py-3 text-gray-700 font-medium">{formatFee(r.monthlyFee)}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {r.startDate} ~ {r.endDate}
                  </td>
                  <td className="px-4 py-3">
                    {r.deposit ? (
                      <span className="text-xs text-green-700">
                        있음{r.depositAmount > 0 ? ` (${r.depositAmount.toLocaleString()}원)` : ""}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">없음</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {r.equipType === "정수기" && r.waterPurifierType ? (
                      <span className="bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-full">{r.waterPurifierType}</span>
                    ) : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_COLORS[r.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {confirmDeleteId === r.id ? (
                      <span className="inline-flex items-center gap-2">
                        <button
                          onClick={() => { deleteRental(r.id); setConfirmDeleteId(null); }}
                          className="text-xs text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded transition-colors"
                        >삭제</button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >취소</button>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-3">
                        <Link href={`/rentals/${r.id}/edit`} className="text-xs text-blue-600 hover:underline">수정</Link>
                        <button
                          onClick={() => setConfirmDeleteId(r.id)}
                          className="text-xs text-red-400 hover:underline"
                        >삭제</button>
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
