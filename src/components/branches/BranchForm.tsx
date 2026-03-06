"use client";

import { useState, FormEvent } from "react";
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

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "지사명을 입력해 주세요.";
    if (!location.trim()) newErrors.location = "지역을 입력해 주세요.";
    if (!manager.trim()) newErrors.manager = "담당자명을 입력해 주세요.";
    if (!contact.trim()) newErrors.contact = "연락처를 입력해 주세요.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: name.trim(),
      location: location.trim(),
      manager: manager.trim(),
      contact: contact.trim(),
    };

    if (isEdit) {
      await updateBranch(branch.id, payload);
    } else {
      await addBranch(payload);
    }
    router.push("/branches");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            지사명 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
            onChange={(e) => setLocation(e.target.value)}
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
            onChange={(e) => setManager(e.target.value)}
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
            onChange={(e) => setContact(e.target.value)}
            placeholder="예: 042-000-0000"
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${errors.contact ? "border-red-400" : "border-gray-200"}`}
          />
          {errors.contact && <p className="text-xs text-red-500 mt-1">{errors.contact}</p>}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white rounded-lg px-4 py-2.5 text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          {isEdit ? "수정 완료" : "지사 추가"}
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
