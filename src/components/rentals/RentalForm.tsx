"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RentalItem } from "@/types";
import { useRentals } from "@/lib/rentalStore";
import { useBranches } from "@/lib/branchStore";
import { useRentalEquipTypes } from "@/lib/rentalEquipTypeStore";

interface RentalFormProps {
  initial?: RentalItem;  // 수정 시 전달
  onSuccess?: () => void; // 모달 등 인라인 사용 시 완료 콜백
}

const WATER_TYPES = ["냉온정수기", "얼음정수기"] as const;
const STATUS_LIST = ["렌트중", "만료", "해지"] as const;

export default function RentalForm({ initial, onSuccess }: RentalFormProps) {
  const router = useRouter();
  const { addRental, updateRental } = useRentals();
  const { branches } = useBranches();
  const { equipTypes } = useRentalEquipTypes();
  const isEdit = !!initial;

  const [branchId, setBranchId]               = useState(initial?.branchId ?? "");
  const [equipType, setEquipType]             = useState<RentalItem["equipType"]>(initial?.equipType ?? "복합기");
  const [modelName, setModelName]             = useState(initial?.modelName ?? "");
  const [vendor, setVendor]                   = useState(initial?.vendor ?? "");
  const [monthlyFee, setMonthlyFee]           = useState(initial?.monthlyFee ? String(initial.monthlyFee) : "");
  const [startDate, setStartDate]             = useState(initial?.startDate ?? "");
  const [endDate, setEndDate]                 = useState(initial?.endDate ?? "");
  const [deposit, setDeposit]                 = useState(initial?.deposit ?? false);
  const [depositAmount, setDepositAmount]     = useState(initial?.depositAmount ? String(initial.depositAmount) : "");
  const [waterType, setWaterType]             = useState<RentalItem["waterPurifierType"]>(initial?.waterPurifierType ?? "");
  const [status, setStatus]                   = useState<RentalItem["status"]>(initial?.status ?? "렌트중");
  const [note, setNote]                       = useState(initial?.note ?? "");
  const [error, setError]                     = useState("");
  const [submitting, setSubmitting]           = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!branchId)  { setError("지사를 선택해 주세요."); return; }
    if (!startDate) { setError("렌트 시작일을 입력해 주세요."); return; }
    if (!endDate)   { setError("렌트 종료일을 입력해 주세요."); return; }
    if (startDate > endDate) { setError("종료일이 시작일보다 빠를 수 없습니다."); return; }
    if (equipType === "정수기" && !waterType) { setError("정수기 유형을 선택해 주세요."); return; }

    const payload: Omit<RentalItem, "id"> = {
      branchId,
      equipType,
      modelName: modelName.trim(),
      vendor: vendor.trim(),
      monthlyFee: monthlyFee ? parseInt(monthlyFee.replace(/,/g, ""), 10) : 0,
      startDate,
      endDate,
      deposit,
      depositAmount: deposit && depositAmount ? parseInt(depositAmount.replace(/,/g, ""), 10) : 0,
      waterPurifierType: equipType === "정수기" ? waterType : "",
      status,
      note: note.trim(),
    };

    setSubmitting(true);
    try {
      if (isEdit && initial) {
        await updateRental(initial.id, payload);
      } else {
        await addRental(payload);
      }
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/rentals");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장 실패");
      setSubmitting(false);
    }
  }

  const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 지사 */}
      <div>
        <label className={labelCls}>지사 <span className="text-red-500">*</span></label>
        <select value={branchId} onChange={(e) => setBranchId(e.target.value)} className={inputCls}>
          <option value="">지사 선택</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>

      {/* 장비 유형 */}
      <div>
        <label className={labelCls}>장비 유형 <span className="text-red-500">*</span></label>
        <div className="flex flex-wrap gap-3">
          {equipTypes.map((t) => (
            <label key={t.id} className="flex items-center gap-1.5 cursor-pointer text-sm">
              <input
                type="radio"
                name="equipType"
                value={t.name}
                checked={equipType === t.name}
                onChange={() => { setEquipType(t.name); if (t.name !== "정수기") setWaterType(""); }}
                className="accent-blue-600"
              />
              {t.name}
            </label>
          ))}
        </div>
      </div>

      {/* 정수기 유형 (정수기 선택 시만 표시) */}
      {equipType === "정수기" && (
        <div>
          <label className={labelCls}>정수기 유형 <span className="text-red-500">*</span></label>
          <div className="flex gap-3">
            {WATER_TYPES.map((t) => (
              <label key={t} className="flex items-center gap-1.5 cursor-pointer text-sm">
                <input
                  type="radio"
                  name="waterType"
                  value={t}
                  checked={waterType === t}
                  onChange={() => setWaterType(t)}
                  className="accent-blue-600"
                />
                {t}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* 모델명 / 업체 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>모델명</label>
          <input type="text" value={modelName} onChange={(e) => setModelName(e.target.value)} placeholder="예) 신도리코 D430" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>렌탈 업체</label>
          <input type="text" value={vendor} onChange={(e) => setVendor(e.target.value)} placeholder="예) 코웨이" className={inputCls} />
        </div>
      </div>

      {/* 월 렌트비 */}
      <div>
        <label className={labelCls}>월 렌트비 (원)</label>
        <input
          type="text"
          inputMode="numeric"
          value={monthlyFee}
          onChange={(e) => setMonthlyFee(e.target.value.replace(/[^0-9]/g, ""))}
          placeholder="예) 55000"
          className={inputCls}
        />
      </div>

      {/* 렌트 기간 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>렌트 시작일 <span className="text-red-500">*</span></label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>렌트 종료일 <span className="text-red-500">*</span></label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputCls} />
        </div>
      </div>

      {/* 보증금 */}
      <div>
        <label className={labelCls}>보증금</label>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-1.5 cursor-pointer text-sm">
            <input type="checkbox" checked={deposit} onChange={(e) => { setDeposit(e.target.checked); if (!e.target.checked) setDepositAmount(""); }} className="accent-blue-600" />
            보증금 있음
          </label>
          {deposit && (
            <input
              type="text"
              inputMode="numeric"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="보증금 금액 (원)"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          )}
        </div>
      </div>

      {/* 상태 */}
      <div>
        <label className={labelCls}>상태</label>
        <select value={status} onChange={(e) => setStatus(e.target.value as RentalItem["status"])} className={inputCls}>
          {STATUS_LIST.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* 비고 */}
      <div>
        <label className={labelCls}>비고</label>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="기타 메모" className={`${inputCls} resize-none`} />
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
        >
          {submitting ? "저장 중..." : isEdit ? "수정 완료" : "등록"}
        </button>
      </div>
    </form>
  );
}
