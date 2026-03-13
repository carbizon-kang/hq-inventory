"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { Asset, AssetStatus } from "@/types";
import { useAssets } from "@/lib/assetStore";
import { useBranches } from "@/lib/branchStore";
import { useCategories } from "@/lib/categoryStore";
import { useItems } from "@/lib/itemStore";

// 품명 → 접두어 매핑 (AssetForm과 동일)
const NAME_PREFIX_MAP: Record<string, string> = {
  "노트북": "NB", "모니터": "MN", "책상": "DK", "의자": "CH",
  "복합기": "MF", "프린터": "PR", "서버": "SV", "스캐너": "SC",
  "빔프로젝터": "PJ", "프로젝터": "PJ", "냉장고": "RF", "에어컨": "AC",
  "TV": "TV", "화이트보드": "WB", "소파": "SF", "사물함": "LK",
  "키보드": "KB", "마우스": "MS", "태블릿": "TB", "카메라": "CM",
  "전화기": "PH", "책장": "BS", "캐비닛": "CB",
};

function getPrefix(name: string, items: { name: string; prefix: string }[]): string {
  const trimmed = name.trim();
  const item = items.find((i) => i.name === trimmed);
  if (item) return item.prefix;
  if (NAME_PREFIX_MAP[trimmed]) return NAME_PREFIX_MAP[trimmed];
  for (const [key, prefix] of Object.entries(NAME_PREFIX_MAP)) {
    if (trimmed.includes(key)) return prefix;
  }
  return trimmed.slice(0, 2).toUpperCase() || "AS";
}

const STATUSES: AssetStatus[] = ["사용중", "보관중", "수리중", "폐기"];

export interface BulkRow {
  name: string;
  category: string;
  branchName: string;
  branchId: string;
  status: AssetStatus;
  purchaseDate: string;
  purchasePrice: number;
  depreciationYears: number;
  note: string;
  assetNumber: string; // 자동 채번
  error?: string;
}

interface AssetBulkUploadProps {
  onCancel: () => void;
}

export default function AssetBulkUpload({ onCancel }: AssetBulkUploadProps) {
  const router = useRouter();
  const { assets, bulkAddAssets } = useAssets();
  const { branches } = useBranches();
  const { categories } = useCategories();
  const { items } = useItems();

  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<BulkRow[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: number; errors: string[] } | null>(null);

  // 자산번호 자동 채번: 기존 assets + 이번 배치에서 이미 사용한 번호 기반
  function assignNumbers(parsed: Omit<BulkRow, "assetNumber">[]): BulkRow[] {
    // prefix별 현재 최대값
    const maxMap: Record<string, number> = {};
    for (const a of assets) {
      const match = a.assetNumber.match(/^([A-Z]+)-(\d+)$/);
      if (match) {
        const p = match[1];
        const n = parseInt(match[2], 10);
        if (!maxMap[p] || n > maxMap[p]) maxMap[p] = n;
      }
    }

    return parsed.map((row) => {
      const prefix = getPrefix(row.name, items);
      const next = (maxMap[prefix] ?? 0) + 1;
      maxMap[prefix] = next;
      const assetNumber = `${prefix}-${String(next).padStart(3, "0")}`;
      return { ...row, assetNumber };
    });
  }

  // 엑셀 파일 파싱
  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const wb = XLSX.read(data, { type: "array", cellDates: true });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const raw: Record<string, unknown>[] = XLSX.utils.sheet_to_json(ws, { defval: "" });

      const today = new Date().toISOString().split("T")[0];
      const defaultCategory = categories[0]?.name ?? "";

      const parsed: Omit<BulkRow, "assetNumber">[] = raw.map((r) => {
        const nameVal = String(r["품명"] ?? r["name"] ?? "").trim();
        const branchName = String(r["지사명"] ?? r["사업장명"] ?? "").trim();
        const branch = branches.find(
          (b) => b.name === branchName || b.name.includes(branchName)
        );
        const statusVal = String(r["상태"] ?? "사용중").trim() as AssetStatus;
        const status = STATUSES.includes(statusVal) ? statusVal : "사용중";

        // 날짜 처리: Date 객체 또는 문자열
        let purchaseDate = today;
        const rawDate = r["구매일"] ?? r["purchase_date"];
        if (rawDate instanceof Date) {
          purchaseDate = rawDate.toISOString().split("T")[0];
        } else if (typeof rawDate === "string" && rawDate) {
          purchaseDate = rawDate.replace(/\./g, "-").slice(0, 10);
        }

        const errors: string[] = [];
        if (!nameVal) errors.push("품명 필수");
        if (!branch) errors.push(`지사 '${branchName}' 없음`);

        return {
          name: nameVal,
          category: String(r["카테고리"] ?? r["category"] ?? defaultCategory).trim() || defaultCategory,
          branchName,
          branchId: branch?.id ?? "",
          status,
          purchaseDate,
          purchasePrice: Number(String(r["매입금액"] ?? r["purchase_price"] ?? "0").replace(/,/g, "")) || 0,
          depreciationYears: Number(r["내용연수"] ?? r["depreciation_years"] ?? 0) || 0,
          note: String(r["비고"] ?? r["note"] ?? "").trim(),
          error: errors.length > 0 ? errors.join(", ") : undefined,
        };
      });

      setRows(assignNumbers(parsed));
    };
    reader.readAsArrayBuffer(file);
  }, [assets, branches, categories, items]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  // 템플릿 다운로드
  function downloadTemplate() {
    const headers = ["품명", "카테고리", "지사명", "상태", "구매일", "매입금액", "내용연수", "비고"];
    const example = [
      "노트북", "PC/모바일", branches[0]?.name ?? "강남지사", "사용중",
      new Date().toISOString().split("T")[0], 1500000, 5, "예시"
    ];
    const ws = XLSX.utils.aoa_to_sheet([headers, example]);
    ws["!cols"] = headers.map(() => ({ wch: 16 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "자산등록");
    XLSX.writeFile(wb, "자산_일괄등록_양식.xlsx");
  }

  async function handleSubmit() {
    const valid = rows.filter((r) => !r.error && r.name && r.branchId);
    if (valid.length === 0) return;
    setSubmitting(true);
    const toAdd: Omit<Asset, "id">[] = valid.map((r) => ({
      assetNumber: r.assetNumber,
      name: r.name,
      category: r.category,
      branchId: r.branchId,
      status: r.status,
      purchaseDate: r.purchaseDate,
      purchasePrice: r.purchasePrice,
      depreciationYears: r.depreciationYears,
      note: r.note,
    }));
    const res = await bulkAddAssets(toAdd);
    setResult(res);
    setSubmitting(false);
    if (res.errors.length === 0) {
      setTimeout(() => router.push("/assets"), 1500);
    }
  }

  const validCount = rows.filter((r) => !r.error).length;
  const errorCount = rows.filter((r) => !!r.error).length;

  return (
    <div className="space-y-5">
      {/* Step 1: 템플릿 다운로드 */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <p className="text-sm font-medium text-blue-800 mb-2">① 양식 다운로드</p>
        <p className="text-xs text-blue-600 mb-3">
          아래 버튼으로 엑셀 양식을 받아 작성 후 업로드하세요.
          <br />필수 열: <strong>품명, 지사명</strong> / 선택: 카테고리, 상태, 구매일, 매입금액, 내용연수, 비고
        </p>
        <button
          onClick={downloadTemplate}
          className="inline-flex items-center gap-2 bg-white border border-blue-200 text-blue-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
        >
          ↓ 자산_일괄등록_양식.xlsx
        </button>
      </div>

      {/* Step 2: 파일 업로드 */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">② 작성한 파일 업로드</p>
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
        >
          <p className="text-sm text-gray-500">엑셀 파일을 여기에 끌어다 놓거나 클릭하여 선택</p>
          <p className="text-xs text-gray-400 mt-1">.xlsx, .xls 파일</p>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Step 3: 미리보기 */}
      {rows.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">
              ③ 미리보기 &nbsp;
              <span className="text-green-600">{validCount}건 정상</span>
              {errorCount > 0 && <span className="text-red-500 ml-2">{errorCount}건 오류</span>}
            </p>
            <button
              onClick={() => { setRows([]); setResult(null); if (fileRef.current) fileRef.current.value = ""; }}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              초기화
            </button>
          </div>

          <div className="overflow-x-auto border border-gray-200 rounded-xl">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 py-2 text-left font-medium text-gray-500">자산번호(자동)</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500">품명</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500">카테고리</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500">지사명</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500">상태</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500">구매일</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500">매입금액</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500">비고</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500">상태</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr
                    key={i}
                    className={`border-b border-gray-100 ${row.error ? "bg-red-50" : "hover:bg-gray-50"}`}
                  >
                    <td className="px-3 py-2 font-mono text-blue-700 font-medium">{row.assetNumber}</td>
                    <td className="px-3 py-2 text-gray-800">{row.name || <span className="text-red-400">-</span>}</td>
                    <td className="px-3 py-2 text-gray-600">{row.category}</td>
                    <td className="px-3 py-2 text-gray-600">{row.branchName || <span className="text-red-400">-</span>}</td>
                    <td className="px-3 py-2 text-gray-600">{row.status}</td>
                    <td className="px-3 py-2 text-gray-600">{row.purchaseDate}</td>
                    <td className="px-3 py-2 text-gray-600">
                      {row.purchasePrice > 0 ? row.purchasePrice.toLocaleString() + "원" : "-"}
                    </td>
                    <td className="px-3 py-2 text-gray-500">{row.note || "-"}</td>
                    <td className="px-3 py-2">
                      {row.error
                        ? <span className="text-red-500">{row.error}</span>
                        : <span className="text-green-600">✓</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 결과 메시지 */}
          {result && (
            <div className={`mt-3 rounded-lg px-4 py-3 text-sm font-medium ${
              result.errors.length === 0
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-yellow-50 border border-yellow-200 text-yellow-800"
            }`}>
              {result.success}건 등록 완료
              {result.errors.length > 0 && (
                <ul className="mt-1 text-xs list-disc list-inside">
                  {result.errors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              )}
            </div>
          )}

          {/* 등록 버튼 */}
          {!result && (
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleSubmit}
                disabled={submitting || validCount === 0}
                className="flex-1 bg-blue-600 text-white rounded-lg px-4 py-2.5 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? "등록 중..." : `${validCount}건 일괄 등록`}
              </button>
              <button
                onClick={onCancel}
                className="flex-1 bg-gray-100 text-gray-700 rounded-lg px-4 py-2.5 text-sm font-semibold hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
            </div>
          )}
        </div>
      )}

      {rows.length === 0 && (
        <button
          onClick={onCancel}
          className="w-full bg-gray-100 text-gray-700 rounded-lg px-4 py-2.5 text-sm font-semibold hover:bg-gray-200 transition-colors"
        >
          취소
        </button>
      )}
    </div>
  );
}
