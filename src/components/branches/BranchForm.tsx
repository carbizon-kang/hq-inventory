"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Branch } from "@/types";
import { useBranches } from "@/lib/branchStore";

interface BranchFormProps {
  branch?: Branch; // 전달되면 수정 모드
}

export default function BranchForm({ branch }: BranchFormProps) {
  const isEdit = !!branch;
  const router = useRouter();
  const { addBranch, updateBranch } = useBranches();

  const [name, setName] = useState(branch?.name ?? "");
  const [location, setLocation] = useState(branch?.location ?? "");
  const [manager, setManager] = useState(branch?.manager ?? "");
  const [contact, setContact] = useState(branch?.contact ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "지사명을 입력해 주세요.";
    if (!location.trim()) newErrors.location = "지역을 입력해 주세요.";
    if (!manager.trim()) newErrors.manager = "담당자명을 입력해 주세요.";
    if (!contact.trim()) newErrors.contact = "연락처를 입력해 주세요.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError("");
    setSuccess(false);

    const payload = {
      name: name.trim(),
      location: location.trim(),
      manager: manager.trim(),
      contact: contact.trim(),
    };

    try {
      if (isEdit) {
        await updateBranch(branch.id, payload);
        setSuccess(true);
        // 수정 완료 후 1.2초 뒤 목록으로 이동
        setTimeout(() => router.push("/branches"), 1200);
      } else {
        await addBranch(payload);
        // 등록 완료 후 폼 초기화 (페이지 이동 없이 연속 등록 가능)
        setName("");
        setLocation("");
        setManager("");
        setContact("");
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "처리 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* 성공 메시지 */}
      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm font-medium">
          <span>✓</span>
          <span>
            {isEdit
              ? "수정이 완료되었습니다. 목록으로 이동합니다."
              : "지사가 등록되었습니다. 계속 등록할 수 있습니다."}
          </span>
        </div>
      )}

      {/* 에러 메시지 */}
      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm">
          {submitError}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            지사명 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: "" })); }}
            placeholder="예: 대전지사"
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${errors.name ? "border-red-400" : "border-gray-200"}`}
          />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            지역 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => { setLocation(e.target.value); setErrors((p) => ({ ...p, location: "" })); }}
            placeholder="예: 대전"
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${errors.location ? "border-red-400" : "border-gray-200"}`}
          />
          {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            담당자 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={manager}
            onChange={(e) => { setManager(e.target.value); setErrors((p) => ({ ...p, manager: "" })); }}
            placeholder="예: 홍길동"
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${errors.manager ? "border-red-400" : "border-gray-200"}`}
          />
          {errors.manager && <p className="text-xs text-red-500 mt-1">{errors.manager}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            연락처 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={contact}
            onChange={(e) => { setContact(e.target.value); setErrors((p) => ({ ...p, contact: "" })); }}
            placeholder="예: 042-000-0000"
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${errors.contact ? "border-red-400" : "border-gray-200"}`}
          />
          {errors.contact && <p className="text-xs text-red-500 mt-1">{errors.contact}</p>}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 bg-blue-600 text-white rounded-lg px-4 py-2.5 text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
        >
          {submitting ? "처리 중..." : isEdit ? "수정 완료" : "지사 추가"}
        </button>
        <Link
          href="/branches"
          className="flex-1 text-center bg-gray-100 text-gray-700 rounded-lg px-4 py-2.5 text-sm font-semibold hover:bg-gray-200 transition-colors"
        >
          {isEdit ? "취소" : "목록으로"}
        </Link>
      </div>
    </form>
  );
}
