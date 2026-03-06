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

  // 정액법 감가상각 계산
  function calcDepreciation(asset: { purchasePrice: number; depreciationYears: number; purchaseDate: string }) {
    if (!asset.purchasePrice || !asset.depreciationYears) return null;
    const annual = asset.purchasePrice / asset.depreciationYears;
    const msElapsed = Date.now() - new Date(asset.purchaseDate).getTime();
    const yearsElapsed = msElapsed / (1000 * 60 * 60 * 24 * 365.25);
    const accumulated = Math.min(asset.purchasePrice, annual * yearsElapsed);
    const bookValue = Math.max(0, asset.purchasePrice - accumulated);
    const done = yearsElapsed >= asset.depreciationYears;
    return { annual, yearsElapsed, accumulated, bookValue, done };
  }

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

        {/* 감가상각 */}
        {(() => {
          const dep = calcDepreciation(asset);
          if (!dep) return null;
          const fmt = (n: number) => Math.round(n).toLocaleString();
          return (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-800">감가상각 현황 (정액법)</h2>
                {dep.done && (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full font-medium">감가상각 완료</span>
                )}
              </div>
              {/* 진행 바 */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>감가상각 진행률</span>
                  <span>{Math.min(100, Math.round((dep.yearsElapsed / asset.depreciationYears) * 100))}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${dep.done ? "bg-gray-400" : "bg-blue-500"}`}
                    style={{ width: `${Math.min(100, (dep.yearsElapsed / asset.depreciationYears) * 100)}%` }}
                  />
                </div>
              </div>
              {/* 수치 */}
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 rounded-lg p-3">
                  <dt className="text-xs text-gray-400 mb-1">매입금액</dt>
                  <dd className="font-semibold text-gray-800">{fmt(asset.purchasePrice)}원</dd>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <dt className="text-xs text-gray-400 mb-1">연간 감가상각액</dt>
                  <dd className="font-semibold text-gray-800">{fmt(dep.annual)}원</dd>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <dt className="text-xs text-gray-400 mb-1">누적 감가상각액</dt>
                  <dd className="font-semibold text-orange-600">{fmt(dep.accumulated)}원</dd>
                </div>
                <div className={`rounded-lg p-3 ${dep.done ? "bg-gray-50" : "bg-blue-50"}`}>
                  <dt className="text-xs text-gray-400 mb-1">현재 장부가액</dt>
                  <dd className={`font-bold text-lg ${dep.done ? "text-gray-500" : "text-blue-700"}`}>{fmt(dep.bookValue)}원</dd>
                </div>
              </dl>
              <p className="text-xs text-gray-400 mt-3">
                내용연수 {asset.depreciationYears}년 · 경과 {dep.yearsElapsed.toFixed(1)}년
                {!dep.done && ` · 잔존 ${(asset.depreciationYears - dep.yearsElapsed).toFixed(1)}년`}
              </p>
            </div>
          );
        })()}

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
