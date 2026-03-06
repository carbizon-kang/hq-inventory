"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import Header from "@/components/layout/Header";
import { useAssets } from "@/lib/assetStore";
import { useBranches } from "@/lib/branchStore";

const STATUS_COLORS: Record<string, string> = {
  "사용중": "bg-green-100 text-green-700",
  "보관중": "bg-blue-100 text-blue-700",
  "수리중": "bg-yellow-100 text-yellow-700",
  "폐기": "bg-red-100 text-red-700",
};

export default function AssetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { assets, getAssetTransfers, updateTransfer, deleteTransfer } = useAssets();
  const { branches } = useBranches();

  // 편집 중인 이력 상태
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editManager, setEditManager] = useState("");
  const [editReason, setEditReason] = useState("");
  const [editError, setEditError] = useState("");
  const [saving, setSaving] = useState(false);

  const asset = assets.find((a) => a.id === id);
  const transfers = getAssetTransfers(id);

  const getBranchName = (branchId: string) =>
    branches.find((b) => b.id === branchId)?.name ?? branchId;

  function startEdit(t: { id: string; transferDate: string; manager: string; reason: string }) {
    setEditingId(t.id);
    setEditDate(t.transferDate);
    setEditManager(t.manager);
    setEditReason(t.reason);
    setEditError("");
  }

  async function handleSave(transferId: string) {
    if (!editManager.trim()) { setEditError("담당자를 입력해 주세요."); return; }
    if (!editDate) { setEditError("이동일을 입력해 주세요."); return; }
    setSaving(true);
    try {
      await updateTransfer(transferId, { transferDate: editDate, manager: editManager.trim(), reason: editReason.trim() });
      setEditingId(null);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "수정 실패");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(transferId: string) {
    if (!confirm("이 이동 이력을 삭제하시겠습니까?")) return;
    try {
      await deleteTransfer(transferId);
    } catch (err) {
      alert(err instanceof Error ? err.message : "삭제 실패");
    }
  }

  if (!asset) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-8">
          <Link href="/assets" className="text-sm text-blue-600 hover:underline mb-4 inline-block">
            ← 자산 목록으로
          </Link>
          <p className="text-gray-500 text-center py-16">존재하지 않는 자산입니다.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div>
          <Link href="/assets" className="text-sm text-blue-600 hover:underline mb-2 inline-block">
            ← 자산 목록으로
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{asset.name}</h1>
              <p className="text-sm font-mono text-blue-600 mt-0.5">{asset.assetNumber}</p>
            </div>
            <span className={`text-sm font-semibold px-3 py-1.5 rounded-full ${STATUS_COLORS[asset.status] ?? "bg-gray-100 text-gray-600"}`}>
              {asset.status}
            </span>
          </div>
        </div>

        {/* 자산 정보 */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-4">자산 정보</h2>
          <dl className="space-y-3 text-sm">
            {[
              { label: "자산번호", value: asset.assetNumber, mono: true },
              { label: "품명", value: asset.name },
              { label: "카테고리", value: asset.category },
              { label: "현재 지사", value: getBranchName(asset.branchId) },
              { label: "상태", value: asset.status },
              { label: "구매일", value: asset.purchaseDate },
              { label: "비고", value: asset.note || "-" },
            ].map(({ label, value, mono }) => (
              <div key={label} className="flex gap-4">
                <dt className="w-24 text-gray-400 shrink-0">{label}</dt>
                <dd className={`font-medium text-gray-800 ${mono ? "font-mono" : ""}`}>{value}</dd>
              </div>
            ))}
          </dl>
          <div className="flex gap-3 mt-5 pt-4 border-t border-gray-100">
            <Link
              href={`/assets/${asset.id}/edit`}
              className="flex-1 text-center bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              자산 수정
            </Link>
            <Link
              href={`/assets/${asset.id}/transfer`}
              className="flex-1 text-center bg-white border border-blue-600 text-blue-600 rounded-lg px-4 py-2 text-sm font-semibold hover:bg-blue-50 transition-colors"
            >
              지사 이동
            </Link>
          </div>
        </div>

        {/* 이동 이력 */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-4">이동 이력</h2>
          {transfers.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">이동 이력이 없습니다.</p>
          ) : (
            <ol className="relative border-l-2 border-gray-100 space-y-4 pl-5">
              {transfers.map((t) => (
                <li key={t.id} className="relative">
                  <span className="absolute -left-[22px] top-1 w-3 h-3 bg-blue-400 rounded-full border-2 border-white" />

                  {editingId === t.id ? (
                    /* 인라인 편집 폼 */
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 space-y-2">
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="text-xs text-gray-500 mb-0.5 block">이동일</label>
                          <input
                            type="date"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-xs text-gray-500 mb-0.5 block">담당자</label>
                          <input
                            type="text"
                            value={editManager}
                            onChange={(e) => setEditManager(e.target.value)}
                            className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-0.5 block">이동 사유</label>
                        <input
                          type="text"
                          value={editReason}
                          onChange={(e) => setEditReason(e.target.value)}
                          placeholder="이동 사유 (선택)"
                          className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                      </div>
                      {editError && <p className="text-xs text-red-500">{editError}</p>}
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => handleSave(t.id)}
                          disabled={saving}
                          className="flex-1 bg-blue-600 text-white rounded px-3 py-1.5 text-xs font-semibold hover:bg-blue-700 disabled:opacity-50"
                        >
                          {saving ? "저장 중..." : "저장"}
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="flex-1 bg-gray-100 text-gray-600 rounded px-3 py-1.5 text-xs font-semibold hover:bg-gray-200"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* 일반 표시 */
                    <div className="group flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">{t.transferDate}</p>
                        <p className="text-sm font-medium text-gray-800">
                          <span className="text-gray-600">{getBranchName(t.fromBranchId)}</span>
                          <span className="mx-2 text-blue-400">→</span>
                          <span className="text-blue-700">{getBranchName(t.toBranchId)}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          담당: {t.manager}
                          {t.reason && ` · ${t.reason}`}
                        </p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          onClick={() => startEdit(t)}
                          className="text-xs text-blue-500 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ol>
          )}
        </div>
      </main>
    </div>
  );
}
