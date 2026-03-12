"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Branch } from "@/types";
import { useBranches } from "@/lib/branchStore";
import { useOrg } from "@/lib/orgStore";

interface BranchFormProps {
  branch?: Branch;
}

export default function BranchForm({ branch }: BranchFormProps) {
  const isEdit = !!branch;
  const router = useRouter();
  const { addBranch, updateBranch } = useBranches();
  const { divisions, getHQsByDivision, getTeamsByHQ } = useOrg();

  const [division,     setDivision]     = useState(branch?.division ?? "");
  const [headquarters, setHeadquarters] = useState(branch?.headquarters ?? "");
  const [team,         setTeam]         = useState(branch?.team ?? "");
  const [name,         setName]         = useState(branch?.name ?? "");
  const [location,     setLocation]     = useState(branch?.location ?? "");
  const [manager,      setManager]      = useState(branch?.manager ?? "");
  const [contact,      setContact]      = useState(branch?.contact ?? "");
  const [errors,       setErrors]       = useState<Record<string, string>>({});
  const [submitError,  setSubmitError]  = useState("");
  const [success,      setSuccess]      = useState(false);
  const [submitting,   setSubmitting]   = useState(false);

  // 연계 드롭다운 옵션
  const hqOptions   = division ? getHQsByDivision(division) : [];
  const teamOptions = headquarters ? getTeamsByHQ(headquarters) : [];

  function handleDivisionChange(v: string) {
    setDivision(v);
    setHeadquarters("");
    setTeam("");
  }

  function handleHQChange(v: string) {
    setHeadquarters(v);
    setTeam("");
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!name.trim())     e.name     = "사업장명을 입력해 주세요.";
    if (!location.trim()) e.location = "지역을 입력해 주세요.";
    if (!manager.trim())  e.manager  = "담당자명을 입력해 주세요.";
    if (!contact.trim())  e.contact  = "연락처를 입력해 주세요.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError("");
    setSuccess(false);

    const payload = {
      division: division.trim(),
      headquarters: headquarters.trim(),
      team: team.trim(),
      name: name.trim(),
      location: location.trim(),
      manager: manager.trim(),
      contact: contact.trim(),
    };

    try {
      if (isEdit) {
        await updateBranch(branch.id, payload);
        setSuccess(true);
        setTimeout(() => router.push("/branches"), 1200);
      } else {
        await addBranch(payload);
        setDivision(""); setHeadquarters(""); setTeam("");
        setName(""); setLocation(""); setManager(""); setContact("");
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

      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm font-medium">
          <span>✓</span>
          <span>{isEdit ? "수정이 완료되었습니다. 목록으로 이동합니다." : "지사가 등록되었습니다. 계속 등록할 수 있습니다."}</span>
        </div>
      )}
      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm">{submitError}</div>
      )}

      {/* ── 조직 계층 ── */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">조직 계층 (선택)</p>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-3">
          {/* 경로 미리보기 */}
          <div className="flex items-center gap-1 text-xs font-medium flex-wrap">
            <span className={division ? "text-blue-700" : "text-gray-300"}>{division || "부문"}</span>
            <span className="text-gray-300">›</span>
            <span className={headquarters ? "text-blue-700" : "text-gray-300"}>{headquarters || "본부"}</span>
            <span className="text-gray-300">›</span>
            <span className={team ? "text-blue-700" : "text-gray-300"}>{team || "팀"}</span>
            <span className="text-gray-300">›</span>
            <span className={name ? "text-blue-800 font-bold" : "text-gray-300"}>{name || "사업장"}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 부문 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">부문</label>
              <select
                value={division}
                onChange={(e) => handleDivisionChange(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
              >
                <option value="">선택 안 함</option>
                {divisions.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
              </select>
            </div>

            {/* 본부 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">본부</label>
              <select
                value={headquarters}
                onChange={(e) => handleHQChange(e.target.value)}
                disabled={!division || hqOptions.length === 0}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white disabled:opacity-40"
              >
                <option value="">선택 안 함</option>
                {hqOptions.map((h) => <option key={h.id} value={h.name}>{h.name}</option>)}
              </select>
            </div>

            {/* 팀 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">팀</label>
              <select
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                disabled={!headquarters || teamOptions.length === 0}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white disabled:opacity-40"
              >
                <option value="">선택 안 함</option>
                {teamOptions.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
              </select>
            </div>
          </div>

          {divisions.length === 0 && (
            <p className="text-xs text-blue-400">
              설정 페이지에서 부문/본부/팀을 먼저 등록하면 여기서 선택할 수 있습니다.
            </p>
          )}
        </div>
      </div>

      {/* ── 사업장 정보 ── */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">사업장 정보</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              사업장명 <span className="text-red-500">*</span>
            </label>
            <input type="text" value={name}
              onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: "" })); }}
              placeholder="예: 대전사업장"
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${errors.name ? "border-red-400" : "border-gray-200"}`}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              지역 <span className="text-red-500">*</span>
            </label>
            <input type="text" value={location}
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
            <input type="text" value={manager}
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
            <input type="text" value={contact}
              onChange={(e) => { setContact(e.target.value); setErrors((p) => ({ ...p, contact: "" })); }}
              placeholder="예: 042-000-0000"
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${errors.contact ? "border-red-400" : "border-gray-200"}`}
            />
            {errors.contact && <p className="text-xs text-red-500 mt-1">{errors.contact}</p>}
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={submitting}
          className="flex-1 bg-blue-600 text-white rounded-lg px-4 py-2.5 text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
        >
          {submitting ? "처리 중..." : isEdit ? "수정 완료" : "지사 추가"}
        </button>
        <Link href="/branches"
          className="flex-1 text-center bg-gray-100 text-gray-700 rounded-lg px-4 py-2.5 text-sm font-semibold hover:bg-gray-200 transition-colors"
        >
          {isEdit ? "취소" : "목록으로"}
        </Link>
      </div>
    </form>
  );
}
