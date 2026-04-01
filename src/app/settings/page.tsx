"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import { useCategories } from "@/lib/categoryStore";
import { useItems } from "@/lib/itemStore";
import { useAuth } from "@/lib/authStore";
import { useOrg } from "@/lib/orgStore";
import { useRentalEquipTypes } from "@/lib/rentalEquipTypeStore";

export default function SettingsPage() {
  const { categories, addCategory, deleteCategory } = useCategories();
  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const { items, addItem, deleteItem } = useItems();
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrefix, setNewItemPrefix] = useState("");
  const [itemError, setItemError] = useState("");
  const [confirmDeleteItemId, setConfirmDeleteItemId] = useState<string | null>(null);

  const { equipTypes, addEquipType, deleteEquipType } = useRentalEquipTypes();
  const [newEquipTypeName, setNewEquipTypeName] = useState("");
  const [equipTypeError, setEquipTypeError] = useState("");
  const [confirmDeleteEquipTypeId, setConfirmDeleteEquipTypeId] = useState<string | null>(null);

  const { changePassword, isAdmin, currentUser, users, updateUser, deleteUser } = useAuth();
  const [confirmDeleteUserId, setConfirmDeleteUserId] = useState<string | null>(null);
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [newPw2, setNewPw2] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  // 조직 관리
  const { divisions, headquarters, teams, addOrgUnit, updateOrgUnit, deleteOrgUnit, getHQsByDivision, getTeamsByHQ } = useOrg();
  const [newDivName, setNewDivName] = useState("");
  const [divError, setDivError] = useState("");
  const [confirmDeleteDivId, setConfirmDeleteDivId] = useState<string | null>(null);
  const [editDivId, setEditDivId] = useState<string | null>(null);
  const [editDivName, setEditDivName] = useState("");

  const [newHQName, setNewHQName] = useState("");
  const [newHQParent, setNewHQParent] = useState("");
  const [hqError, setHQError] = useState("");
  const [confirmDeleteHQId, setConfirmDeleteHQId] = useState<string | null>(null);
  const [editHQId, setEditHQId] = useState<string | null>(null);
  const [editHQName, setEditHQName] = useState("");

  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamParent, setNewTeamParent] = useState("");
  const [teamError, setTeamError] = useState("");
  const [confirmDeleteTeamId, setConfirmDeleteTeamId] = useState<string | null>(null);
  const [editTeamId, setEditTeamId] = useState<string | null>(null);
  const [editTeamName, setEditTeamName] = useState("");

  async function handleUpdateOrg(id: string, name: string, clearEdit: () => void) {
    const trimmed = name.trim();
    if (!trimmed) return;
    await updateOrgUnit(id, trimmed);
    clearEdit();
  }

  async function handleChangePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");
    if (!oldPw) { setPwError("현재 비밀번호를 입력해 주세요."); return; }
    if (!newPw) { setPwError("새 비밀번호를 입력해 주세요."); return; }
    if (newPw.length < 6) { setPwError("새 비밀번호는 6자 이상이어야 합니다."); return; }
    if (newPw !== newPw2) { setPwError("새 비밀번호가 일치하지 않습니다."); return; }
    try {
      await changePassword(oldPw, newPw);
      setOldPw("");
      setNewPw("");
      setNewPw2("");
      setPwSuccess("비밀번호가 성공적으로 변경되었습니다.");
    } catch (err) {
      setPwError(err instanceof Error ? err.message : "변경 실패");
    }
  }

  async function handleAddItem(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = newItemName.trim();
    const prefix = newItemPrefix.trim().toUpperCase();
    if (!name) { setItemError("품명을 입력해 주세요."); return; }
    if (!prefix) { setItemError("접두어를 입력해 주세요."); return; }
    if (items.some((i) => i.name === name)) { setItemError("이미 존재하는 품명입니다."); return; }
    try {
      await addItem(name, prefix);
      setNewItemName("");
      setNewItemPrefix("");
      setItemError("");
    } catch (err) {
      setItemError(err instanceof Error ? err.message : "추가 실패");
    }
  }

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) {
      setError("카테고리 이름을 입력해 주세요.");
      return;
    }
    if (categories.some((c) => c.name === trimmed)) {
      setError("이미 존재하는 카테고리입니다.");
      return;
    }
    await addCategory(trimmed);
    setNewName("");
    setError("");
  }

  async function handleAddEquipType(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = newEquipTypeName.trim();
    if (!name) { setEquipTypeError("장비 유형 이름을 입력해 주세요."); return; }
    if (equipTypes.some((t) => t.name === name)) { setEquipTypeError("이미 존재하는 유형입니다."); return; }
    try {
      await addEquipType(name);
      setNewEquipTypeName("");
      setEquipTypeError("");
    } catch (err) {
      setEquipTypeError(err instanceof Error ? err.message : "추가 실패");
    }
  }

  async function handleAddDivision(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = newDivName.trim();
    if (!name) { setDivError("부문명을 입력해 주세요."); return; }
    if (divisions.some((d) => d.name === name)) { setDivError("이미 존재하는 부문입니다."); return; }
    try {
      await addOrgUnit("부문", name, "");
      setNewDivName("");
      setDivError("");
    } catch (err) {
      setDivError(err instanceof Error ? err.message : "추가 실패");
    }
  }

  async function handleAddHQ(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = newHQName.trim();
    if (!name) { setHQError("본부명을 입력해 주세요."); return; }
    if (!newHQParent) { setHQError("상위 부문을 선택해 주세요."); return; }
    if (headquarters.some((h) => h.name === name && h.parentName === newHQParent)) {
      setHQError("해당 부문에 이미 존재하는 본부입니다."); return;
    }
    try {
      await addOrgUnit("본부", name, newHQParent);
      setNewHQName("");
      setNewHQParent("");
      setHQError("");
    } catch (err) {
      setHQError(err instanceof Error ? err.message : "추가 실패");
    }
  }

  async function handleAddTeam(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = newTeamName.trim();
    if (!name) { setTeamError("팀명을 입력해 주세요."); return; }
    if (!newTeamParent) { setTeamError("상위 본부를 선택해 주세요."); return; }
    if (teams.some((t) => t.name === name && t.parentName === newTeamParent)) {
      setTeamError("해당 본부에 이미 존재하는 팀입니다."); return;
    }
    try {
      await addOrgUnit("팀", name, newTeamParent);
      setNewTeamName("");
      setNewTeamParent("");
      setTeamError("");
    } catch (err) {
      setTeamError(err instanceof Error ? err.message : "추가 실패");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">설정</h1>
          <p className="text-sm text-gray-500 mt-1">카테고리 및 시스템 설정 관리</p>
        </div>

        {/* ── 사용자 관리 (관리자 전용) ── */}
        {isAdmin && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-1">사용자 관리</h2>
            <p className="text-xs text-gray-400 mb-4">가입한 사용자의 권한과 담당 부문을 설정합니다.</p>
            <ul className="space-y-2">
              {users.map((u) => (
                <li key={u.id} className="flex flex-wrap items-center gap-2 px-4 py-3 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-sm font-semibold text-gray-800">{u.username}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${u.role === "admin" ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-600"}`}>
                      {u.role === "admin" ? "관리자" : "일반"}
                    </span>
                  </div>
                  {/* 권한 변경 */}
                  <select
                    value={u.role}
                    onChange={(e) => updateUser(u.id, { role: e.target.value as "admin" | "user" })}
                    disabled={u.id === currentUser?.id}
                    className="border border-gray-200 rounded-lg px-2 py-1 text-xs bg-white focus:outline-none disabled:opacity-40"
                  >
                    <option value="admin">관리자</option>
                    <option value="user">일반 사용자</option>
                  </select>
                  {/* 부문 배정 */}
                  <select
                    value={u.division}
                    onChange={(e) => updateUser(u.id, { division: e.target.value })}
                    disabled={u.role === "admin"}
                    className="border border-gray-200 rounded-lg px-2 py-1 text-xs bg-white focus:outline-none disabled:opacity-40"
                  >
                    <option value="">부문 미배정</option>
                    {divisions.map((d) => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                  {/* 삭제 */}
                  {u.id !== currentUser?.id && (
                    confirmDeleteUserId === u.id ? (
                      <span className="flex items-center gap-1">
                        <button onClick={() => { deleteUser(u.id); setConfirmDeleteUserId(null); }}
                          className="text-xs text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded">삭제</button>
                        <button onClick={() => setConfirmDeleteUserId(null)}
                          className="text-xs text-gray-500 hover:text-gray-700">취소</button>
                      </span>
                    ) : (
                      <button onClick={() => setConfirmDeleteUserId(u.id)}
                        className="text-xs text-red-400 hover:underline">삭제</button>
                    )
                  )}
                </li>
              ))}
              {users.length === 0 && <p className="text-xs text-gray-400 text-center py-2">등록된 사용자가 없습니다.</p>}
            </ul>
          </div>
        )}

        {/* ── 조직 계층 관리 ── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-base font-semibold text-gray-800 mb-1">조직 계층 관리</h2>
            <p className="text-xs text-gray-400">부문 → 본부 → 팀 순서로 추가하세요. 지사 등록 시 드롭다운으로 선택됩니다.</p>
          </div>

          {/* 부문 */}
          <div>
            <h3 className="text-sm font-semibold text-blue-700 mb-2 flex items-center gap-1">
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded">부문</span>
            </h3>
            <form onSubmit={handleAddDivision} className="flex gap-2 mb-3">
              <input
                type="text"
                value={newDivName}
                onChange={(e) => { setNewDivName(e.target.value); setDivError(""); }}
                placeholder="부문명 (예: 영업부문)"
                className={`flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${divError ? "border-red-400" : "border-gray-200"}`}
              />
              <button type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap"
              >+ 추가</button>
            </form>
            {divError && <p className="text-xs text-red-500 mb-2">{divError}</p>}
            <ul className="space-y-1.5">
              {divisions.map((d) => (
                <li key={d.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-blue-50 border border-blue-100">
                  {editDivId === d.id ? (
                    <input
                      autoFocus
                      value={editDivName}
                      onChange={(e) => setEditDivName(e.target.value)}
                      className="flex-1 border border-blue-300 rounded px-2 py-0.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 mr-2"
                    />
                  ) : (
                    <span className="text-sm font-medium text-gray-800">{d.name}</span>
                  )}
                  {editDivId === d.id ? (
                    <span className="flex items-center gap-2">
                      <button onClick={() => handleUpdateOrg(d.id, editDivName, () => setEditDivId(null))}
                        className="text-xs text-white bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded transition-colors">저장</button>
                      <button onClick={() => setEditDivId(null)}
                        className="text-xs text-gray-500 hover:text-gray-700">취소</button>
                    </span>
                  ) : confirmDeleteDivId === d.id ? (
                    <span className="flex items-center gap-2">
                      <button onClick={() => { deleteOrgUnit(d.id); setConfirmDeleteDivId(null); }}
                        className="text-xs text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded transition-colors">삭제</button>
                      <button onClick={() => setConfirmDeleteDivId(null)}
                        className="text-xs text-gray-500 hover:text-gray-700">취소</button>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <button onClick={() => { setEditDivId(d.id); setEditDivName(d.name); }}
                        className="text-xs text-blue-500 hover:underline">수정</button>
                      <button onClick={() => setConfirmDeleteDivId(d.id)}
                        className="text-xs text-red-400 hover:underline">삭제</button>
                    </span>
                  )}
                </li>
              ))}
              {divisions.length === 0 && <p className="text-xs text-gray-400 text-center py-2">등록된 부문이 없습니다.</p>}
            </ul>
          </div>

          {/* 본부 */}
          <div>
            <h3 className="text-sm font-semibold text-blue-700 mb-2 flex items-center gap-1">
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded">본부</span>
            </h3>
            <form onSubmit={handleAddHQ} className="flex gap-2 mb-3">
              <select
                value={newHQParent}
                onChange={(e) => { setNewHQParent(e.target.value); setHQError(""); }}
                className={`w-36 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white ${hqError && !newHQParent ? "border-red-400" : "border-gray-200"}`}
              >
                <option value="">부문 선택</option>
                {divisions.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
              </select>
              <input
                type="text"
                value={newHQName}
                onChange={(e) => { setNewHQName(e.target.value); setHQError(""); }}
                placeholder="본부명 (예: 수도권본부)"
                className={`flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${hqError && !newHQName ? "border-red-400" : "border-gray-200"}`}
              />
              <button type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap"
              >+ 추가</button>
            </form>
            {hqError && <p className="text-xs text-red-500 mb-2">{hqError}</p>}
            <ul className="space-y-1.5">
              {headquarters.map((h) => (
                <li key={h.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-xs text-blue-500 shrink-0">{h.parentName}</span>
                    {editHQId === h.id ? (
                      <input
                        autoFocus
                        value={editHQName}
                        onChange={(e) => setEditHQName(e.target.value)}
                        className="flex-1 border border-blue-300 rounded px-2 py-0.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-800">{h.name}</span>
                    )}
                  </div>
                  {editHQId === h.id ? (
                    <span className="flex items-center gap-2 ml-2">
                      <button onClick={() => handleUpdateOrg(h.id, editHQName, () => setEditHQId(null))}
                        className="text-xs text-white bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded transition-colors">저장</button>
                      <button onClick={() => setEditHQId(null)}
                        className="text-xs text-gray-500 hover:text-gray-700">취소</button>
                    </span>
                  ) : confirmDeleteHQId === h.id ? (
                    <span className="flex items-center gap-2 ml-2">
                      <button onClick={() => { deleteOrgUnit(h.id); setConfirmDeleteHQId(null); }}
                        className="text-xs text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded transition-colors">삭제</button>
                      <button onClick={() => setConfirmDeleteHQId(null)}
                        className="text-xs text-gray-500 hover:text-gray-700">취소</button>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 ml-2">
                      <button onClick={() => { setEditHQId(h.id); setEditHQName(h.name); }}
                        className="text-xs text-blue-500 hover:underline">수정</button>
                      <button onClick={() => setConfirmDeleteHQId(h.id)}
                        className="text-xs text-red-400 hover:underline">삭제</button>
                    </span>
                  )}
                </li>
              ))}
              {headquarters.length === 0 && <p className="text-xs text-gray-400 text-center py-2">등록된 본부가 없습니다.</p>}
            </ul>
          </div>

          {/* 팀 */}
          <div>
            <h3 className="text-sm font-semibold text-blue-700 mb-2 flex items-center gap-1">
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded">팀</span>
            </h3>
            <form onSubmit={handleAddTeam} className="flex gap-2 mb-3">
              <select
                value={newTeamParent}
                onChange={(e) => { setNewTeamParent(e.target.value); setTeamError(""); }}
                className={`w-36 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white ${teamError && !newTeamParent ? "border-red-400" : "border-gray-200"}`}
              >
                <option value="">본부 선택</option>
                {headquarters.map((h) => <option key={h.id} value={h.name}>{h.name}</option>)}
              </select>
              <input
                type="text"
                value={newTeamName}
                onChange={(e) => { setNewTeamName(e.target.value); setTeamError(""); }}
                placeholder="팀명 (예: 서울팀)"
                className={`flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${teamError && !newTeamName ? "border-red-400" : "border-gray-200"}`}
              />
              <button type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap"
              >+ 추가</button>
            </form>
            {teamError && <p className="text-xs text-red-500 mb-2">{teamError}</p>}
            <ul className="space-y-1.5">
              {teams.map((t) => (
                <li key={t.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-xs text-blue-500 shrink-0">{t.parentName}</span>
                    {editTeamId === t.id ? (
                      <input
                        autoFocus
                        value={editTeamName}
                        onChange={(e) => setEditTeamName(e.target.value)}
                        className="flex-1 border border-blue-300 rounded px-2 py-0.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-800">{t.name}</span>
                    )}
                  </div>
                  {editTeamId === t.id ? (
                    <span className="flex items-center gap-2 ml-2">
                      <button onClick={() => handleUpdateOrg(t.id, editTeamName, () => setEditTeamId(null))}
                        className="text-xs text-white bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded transition-colors">저장</button>
                      <button onClick={() => setEditTeamId(null)}
                        className="text-xs text-gray-500 hover:text-gray-700">취소</button>
                    </span>
                  ) : confirmDeleteTeamId === t.id ? (
                    <span className="flex items-center gap-2 ml-2">
                      <button onClick={() => { deleteOrgUnit(t.id); setConfirmDeleteTeamId(null); }}
                        className="text-xs text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded transition-colors">삭제</button>
                      <button onClick={() => setConfirmDeleteTeamId(null)}
                        className="text-xs text-gray-500 hover:text-gray-700">취소</button>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 ml-2">
                      <button onClick={() => { setEditTeamId(t.id); setEditTeamName(t.name); }}
                        className="text-xs text-blue-500 hover:underline">수정</button>
                      <button onClick={() => setConfirmDeleteTeamId(t.id)}
                        className="text-xs text-red-400 hover:underline">삭제</button>
                    </span>
                  )}
                </li>
              ))}
              {teams.length === 0 && <p className="text-xs text-gray-400 text-center py-2">등록된 팀이 없습니다.</p>}
            </ul>
          </div>
        </div>

        {/* 품명 관리 */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-1">품명 관리</h2>
          <p className="text-xs text-gray-400 mb-4">자산 등록 시 선택할 수 있는 품명과 자산번호 접두어를 관리합니다.</p>

          <form onSubmit={handleAddItem} className="flex gap-2 mb-4">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => { setNewItemName(e.target.value); setItemError(""); }}
              placeholder="품명 (예: 노트북)"
              className={`flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                itemError ? "border-red-400" : "border-gray-200"
              }`}
            />
            <input
              type="text"
              value={newItemPrefix}
              onChange={(e) => { setNewItemPrefix(e.target.value.toUpperCase()); setItemError(""); }}
              placeholder="접두어 (예: NB)"
              maxLength={4}
              className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              + 추가
            </button>
          </form>
          {itemError && <p className="text-xs text-red-500 mb-3">{itemError}</p>}

          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{item.prefix}</span>
                  <span className="text-sm font-medium text-gray-800">{item.name}</span>
                  {item.isDefault && (
                    <span className="text-xs text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded">기본</span>
                  )}
                </div>
                {item.isDefault ? (
                  <span className="text-xs text-gray-300">삭제 불가</span>
                ) : confirmDeleteItemId === item.id ? (
                  <span className="flex items-center gap-2">
                    <button
                      onClick={() => { deleteItem(item.id); setConfirmDeleteItemId(null); }}
                      className="text-xs text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded transition-colors"
                    >삭제</button>
                    <button
                      onClick={() => setConfirmDeleteItemId(null)}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >취소</button>
                  </span>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteItemId(item.id)}
                    className="text-xs text-red-400 hover:underline"
                  >삭제</button>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* 렌트 장비 유형 관리 */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-1">렌트 장비 유형 관리</h2>
          <p className="text-xs text-gray-400 mb-4">렌트 등록 시 선택할 수 있는 장비 유형을 관리합니다. (복합기·정수기 등)</p>

          <form onSubmit={handleAddEquipType} className="flex gap-2 mb-4">
            <input
              type="text"
              value={newEquipTypeName}
              onChange={(e) => { setNewEquipTypeName(e.target.value); setEquipTypeError(""); }}
              placeholder="장비 유형 (예: 에어컨, 냉장고)"
              className={`flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                equipTypeError ? "border-red-400" : "border-gray-200"
              }`}
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              + 추가
            </button>
          </form>
          {equipTypeError && <p className="text-xs text-red-500 mb-3">{equipTypeError}</p>}

          <ul className="space-y-2">
            {equipTypes.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-100"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-800">{t.name}</span>
                  {t.isDefault && (
                    <span className="text-xs text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded">기본</span>
                  )}
                </div>
                {t.isDefault ? (
                  <span className="text-xs text-gray-300">삭제 불가</span>
                ) : confirmDeleteEquipTypeId === t.id ? (
                  <span className="flex items-center gap-2">
                    <button
                      onClick={() => { deleteEquipType(t.id); setConfirmDeleteEquipTypeId(null); }}
                      className="text-xs text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded transition-colors"
                    >삭제</button>
                    <button
                      onClick={() => setConfirmDeleteEquipTypeId(null)}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >취소</button>
                  </span>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteEquipTypeId(t.id)}
                    className="text-xs text-red-400 hover:underline"
                  >삭제</button>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* 카테고리 관리 */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-1">카테고리 관리</h2>
          <p className="text-xs text-gray-400 mb-4">재고 품목 및 자산에 적용되는 카테고리를 관리합니다.</p>

          <form onSubmit={handleAdd} className="flex gap-2 mb-4">
            <input
              type="text"
              value={newName}
              onChange={(e) => { setNewName(e.target.value); setError(""); }}
              placeholder="새 카테고리 이름"
              className={`flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                error ? "border-red-400" : "border-gray-200"
              }`}
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              + 추가
            </button>
          </form>
          {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

          <ul className="space-y-2">
            {categories.map((cat) => (
              <li
                key={cat.id}
                className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-100"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-800">{cat.name}</span>
                  {cat.isDefault && (
                    <span className="text-xs text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded">기본</span>
                  )}
                </div>
                {cat.isDefault ? (
                  <span className="text-xs text-gray-300">삭제 불가</span>
                ) : confirmDeleteId === cat.id ? (
                  <span className="flex items-center gap-2">
                    <button
                      onClick={() => { deleteCategory(cat.id); setConfirmDeleteId(null); }}
                      className="text-xs text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded transition-colors"
                    >삭제</button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >취소</button>
                  </span>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(cat.id)}
                    className="text-xs text-red-400 hover:underline"
                  >삭제</button>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* 비밀번호 변경 */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-1">비밀번호 변경</h2>
          <p className="text-xs text-gray-400 mb-4">로그인 비밀번호를 변경합니다. 새 비밀번호는 6자 이상이어야 합니다.</p>

          <form onSubmit={handleChangePassword} className="space-y-3">
            <input
              type="password"
              value={oldPw}
              onChange={(e) => { setOldPw(e.target.value); setPwError(""); setPwSuccess(""); }}
              placeholder="현재 비밀번호"
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                pwError ? "border-red-400" : "border-gray-200"
              }`}
            />
            <input
              type="password"
              value={newPw}
              onChange={(e) => { setNewPw(e.target.value); setPwError(""); setPwSuccess(""); }}
              placeholder="새 비밀번호 (6자 이상)"
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                pwError ? "border-red-400" : "border-gray-200"
              }`}
            />
            <input
              type="password"
              value={newPw2}
              onChange={(e) => { setNewPw2(e.target.value); setPwError(""); setPwSuccess(""); }}
              placeholder="새 비밀번호 확인"
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                pwError ? "border-red-400" : "border-gray-200"
              }`}
            />
            {pwError && <p className="text-xs text-red-500">{pwError}</p>}
            {pwSuccess && <p className="text-xs text-green-600">{pwSuccess}</p>}
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              비밀번호 변경
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
