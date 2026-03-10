"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Branch } from "@/types";
import { useBranches } from "@/lib/branchStore";
import { useAssets } from "@/lib/assetStore";

interface BranchCardProps {
  branch: Branch;
}

export default function BranchCard({ branch }: BranchCardProps) {
  const router = useRouter();
  const { deleteBranch } = useBranches();
  const { assets } = useAssets();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const branchAssets = assets.filter((a) => a.branchId === branch.id);
  const total    = branchAssets.length;
  const inUse    = branchAssets.filter((a) => a.status === "사용중").length;
  const inRepair = branchAssets.filter((a) => a.status === "수리중" || a.status === "폐기").length;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all">
      <div className="flex items-center px-5 py-4 gap-4">

        {/* 지사명 + 위치 */}
        <Link href={`/branches/${branch.id}`} className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate">{branch.name}</p>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{branch.location}</p>
        </Link>

        {/* 담당자 */}
        <div className="hidden sm:block w-28 shrink-0">
          <p className="text-xs text-gray-400">담당자</p>
          <p className="text-sm font-medium text-gray-700 truncate">{branch.manager}</p>
        </div>

        {/* 연락처 */}
        <div className="hidden md:block w-36 shrink-0">
          <p className="text-xs text-gray-400">연락처</p>
          <p className="text-sm font-medium text-gray-700">{branch.contact}</p>
        </div>

        {/* 자산 통계 */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-center w-10">
            <p className="text-base font-bold text-gray-800">{total}</p>
            <p className="text-xs text-gray-400">전체</p>
          </div>
          <div className="text-center w-10">
            <p className="text-base font-bold text-green-600">{inUse}</p>
            <p className="text-xs text-gray-400">사용중</p>
          </div>
          <div className="text-center w-10">
            <p className={`text-base font-bold ${inRepair > 0 ? "text-yellow-500" : "text-gray-800"}`}>
              {inRepair}
            </p>
            <p className="text-xs text-gray-400">수리/폐기</p>
          </div>
        </div>

        {/* 수정/삭제 */}
        <div className="shrink-0 flex items-center gap-2 pl-4 border-l border-gray-100">
          {confirmDelete ? (
            <>
              <span className="text-xs text-gray-500">삭제할까요?</span>
              <button
                onClick={() => { deleteBranch(branch.id); setConfirmDelete(false); }}
                className="text-xs text-white bg-red-500 hover:bg-red-600 px-2.5 py-1.5 rounded-lg transition-colors"
              >삭제</button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-xs text-gray-500 hover:text-gray-700 px-2.5 py-1.5 rounded-lg border border-gray-200 transition-colors"
              >취소</button>
            </>
          ) : (
            <>
              <button
                onClick={() => router.push(`/branches/${branch.id}/edit`)}
                className="text-xs text-blue-600 hover:underline px-1"
              >수정</button>
              <span className="text-gray-200">|</span>
              <button
                onClick={() => setConfirmDelete(true)}
                className="text-xs text-red-400 hover:underline px-1"
              >삭제</button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
