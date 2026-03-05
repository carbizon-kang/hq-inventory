"use client";

import { useState, FormEvent } from "react";
import Header from "@/components/layout/Header";
import { useCategories } from "@/lib/categoryStore";

export default function SettingsPage() {
  const { categories, addCategory, deleteCategory } = useCategories();
  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  function handleAdd(e: FormEvent) {
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
    addCategory(trimmed);
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
      </main>
    </div>
  );
}
