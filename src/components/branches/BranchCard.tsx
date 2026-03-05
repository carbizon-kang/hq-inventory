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
  const total = branchAssets.length;
  const inUse = branchAssets.filter((a) => a.status === "사용중").length;
  const inRepair = branchAssets.filter((a) => a.status === "수리중" || a.status === "폐기").length;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all h-full flex flex-col">
      {/* 카드 본문 */}
      <Link href={`/branches/${branch.id}`} className="block p-5 flex-1">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">{branch.name}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{branch.location}</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600">
            자산 {total}대
          </span>
        </div>

        {/* 담당자 정보 */}
        <div className="text-xs text-gray-500 space-y-1 mb-4">
          <div className="flex gap-2">
            <span className="text-gray-400 w-12">담당자</span>
            <span className="font-medium text-gray-700">{branch.manager}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-400 w-12">연락처</span>
            <span className="font-medium text-gray-700">{branch.contact}</span>
          </div>
        </div>

        {/* 자산 통계 */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
          <div className="text-center">
            <p className="text-lg font-bold text-gray-800">{total}</p>
            <p className="text-xs text-gray-400">전체 자산</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-green-600">{inUse}</p>
            <p className="text-xs text-gray-400">사용중</p>
          </div>
          <div className="text-center">
            <p className={`text-lg font-bold ${inRepair > 0 ? "text-yellow-500" : "text-gray-800"}`}>
              {inRepair}
            </p>
            <p className="text-xs text-gray-400">수리/폐기</p>
          </div>
        </div>
      </Link>

      {/* 수정/삭제 버튼 */}
      <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-end gap-3">
        {confirmDelete ? (
          <>
            <span className="text-xs text-gray-500 mr-auto">정말 삭제할까요?</span>
            <button
              onClick={() => { deleteBranch(branch.id); setConfirmDelete(false); }}
              className="text-xs text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg transition-colors"
            >
              삭제
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 transition-colors"
            >
              취소
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => router.push(`/branches/${branch.id}/edit`)}
              className="text-xs text-blue-600 hover:underline"
            >
              수정
            </button>
            <span className="text-gray-200">|</span>
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-xs text-red-400 hover:underline"
            >
              삭제
            </button>
          </>
        )}
      </div>
    </div>
  );
}
