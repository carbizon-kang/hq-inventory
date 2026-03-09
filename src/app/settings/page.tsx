"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import { useCategories } from "@/lib/categoryStore";
import { useItems } from "@/lib/itemStore";
import { useAuth } from "@/lib/authStore";

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

  const { changePassword } = useAuth();
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [newPw2, setNewPw2] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">설정</h1>
          <p className="text-sm text-gray-500 mt-1">카테고리 및 시스템 설정 관리</p>
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

        {/* 카테고리 관리 */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-1">카테고리 관리</h2>
          <p className="text-xs text-gray-400 mb-4">재고 품목 및 자산에 적용되는 카테고리를 관리합니다.</p>

          {/* 추가 폼 */}
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

          {/* 카테고리 목록 */}
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
