"use client";

import { useState } from "react";
import { useAuth } from "@/lib/authStore";
import { APP_NAME } from "@/lib/constants";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isLoading, login } = useAuth();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!password) { setError("비밀번호를 입력해 주세요."); return; }
    setSubmitting(true);
    setError("");
    const ok = await login(password);
    if (!ok) {
      setError("비밀번호가 올바르지 않습니다.");
    }
    setSubmitting(false);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">로딩 중...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 px-8 py-10 w-full max-w-sm">
          {/* 로고 */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-3">
              <span className="text-white text-xl font-bold">HQ</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">{APP_NAME}</h1>
            <p className="text-xs text-gray-400 mt-1">재고 관리 시스템</p>
          </div>

          {/* 로그인 폼 */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder="비밀번호를 입력하세요"
                className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                  error ? "border-red-400" : "border-gray-200"
                }`}
                autoFocus
              />
              {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60"
            >
              {submitting ? "확인 중..." : "로그인"}
            </button>
          </form>

          <p className="text-xs text-center text-gray-300 mt-6">초기 비밀번호: admin1234</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
