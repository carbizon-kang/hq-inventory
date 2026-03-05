"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Asset } from "@/types";
import { useAssets } from "@/lib/assetStore";
import { useBranches } from "@/lib/branchStore";

interface TransferFormProps {
  asset: Asset;
}

export default function TransferForm({ asset }: TransferFormProps) {
  const router = useRouter();
  const { addTransfer } = useAssets();
  const { branches } = useBranches();

  const today = new Date().toISOString().split("T")[0];
  const otherBranches = branches.filter((b) => b.id !== asset.branchId);

  const [toBranchId, setToBranchId] = useState(otherBranches[0]?.id ?? "");
  const [transferDate, setTransferDate] = useState(today);
  const [manager, setManager] = useState("");
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fromBranch = branches.find((b) => b.id === asset.branchId);
  const toBranch = branches.find((b) => b.id === toBranchId);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!toBranchId) e.toBranchId = "이동 대상 지사를 선택해 주세요.";
    if (!transferDate) e.transferDate = "이동일을 입력해 주세요.";
    if (!manager.trim()) e.manager = "담당자를 입력해 주세요.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    addTransfer({
      assetId: asset.id,
      fromBranchId: asset.branchId,
      toBranchId,
      transferDate,
      manager: manager.trim(),
      reason: reason.trim(),
    });

    router.push(`/assets/${asset.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 이동 요약 */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-center gap-4 text-sm">
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">현재 지사</p>
          <p className="font-semibold text-gray-800">{fromBranch?.name ?? "-"}</p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <span className="text-2xl text-blue-400">→</span>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">이동 대상</p>
          <p className="font-semibold text-blue-700">{toBranch?.name ?? "-"}</p>
        </div>
      </div>

      {/* 이동 대상 지사 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          이동 대상 지사 <span className="text-red-500">*</span>
        </label>
        {otherBranches.length === 0 ? (
          <p className="text-sm text-gray-400">이동 가능한 다른 지사가 없습니다.</p>
        ) : (
          <select
            value={toBranchId}
            onChange={(e) => setToBranchId(e.target.value)}
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${
              errors.toBranchId ? "border-red-400" : "border-gray-200"
            }`}
          >
            {otherBranches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        )}
        {errors.toBranchId && <p className="text-xs text-red-500 mt-1">{errors.toBranchId}</p>}
      </div>

      {/* 이동일 + 담당자 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            이동일 <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={transferDate}
            onChange={(e) => setTransferDate(e.target.value)}
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${
              errors.transferDate ? "border-red-400" : "border-gray-200"
            }`}
          />
          {errors.transferDate && <p className="text-xs text-red-500 mt-1">{errors.transferDate}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            담당자 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={manager}
            onChange={(e) => setManager(e.target.value)}
            placeholder="이동 처리 담당자"
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${
              errors.manager ? "border-red-400" : "border-gray-200"
            }`}
          />
          {errors.manager && <p className="text-xs text-red-500 mt-1">{errors.manager}</p>}
        </div>
      </div>

      {/* 이동 사유 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">이동 사유</label>
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="이동 사유 (선택)"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      </div>

      {/* 버튼 */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={otherBranches.length === 0}
          className="flex-1 bg-blue-600 text-white rounded-lg px-4 py-2.5 text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          이동 처리
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 bg-gray-100 text-gray-700 rounded-lg px-4 py-2.5 text-sm font-semibold hover:bg-gray-200 transition-colors"
        >
          취소
        </button>
      </div>
    </form>
  );
}
