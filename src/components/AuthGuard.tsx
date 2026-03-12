"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/authStore";
import { APP_NAME } from "@/lib/constants";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isLoading, login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) { setPassword(""); setPassword2(""); setError(""); setSuccess(""); }
  }, [isLoggedIn]);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!username.trim()) { setError("아이디를 입력해 주세요."); return; }
    if (!password) { setError("비밀번호를 입력해 주세요."); return; }
    setSubmitting(true); setError("");
    try {
      await login(username.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인 실패");
    }
    setSubmitting(false);
  }

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!username.trim()) { setError("아이디를 입력해 주세요."); return; }
    if (!password) { setError("비밀번호를 입력해 주세요."); return; }
    if (password.length < 6) { setError("비밀번호는 6자 이상이어야 합니다."); return; }
    if (password !== password2) { setError("비밀번호가 일치하지 않습니다."); return; }
    setSubmitting(true); setError("");
    try {
      await register(username.trim(), password);
      setSuccess("회원가입이 완료되었습니다. 관리자가 지사를 배정하면 사용 가능합니다.");
      setMode("login");
      setPassword(""); setPassword2("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "회원가입 실패");
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
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-3">
              <span className="text-white text-xl font-bold">HQ</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">{APP_NAME}</h1>
            <p className="text-xs text-gray-400 mt-1">재고 관리 시스템</p>
          </div>

          {/* 탭 */}
          <div className="flex rounded-lg border border-gray-200 mb-6 overflow-hidden">
            <button
              onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
              className={`flex-1 py-2 text-sm font-semibold transition-colors ${mode === "login" ? "bg-blue-600 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
            >로그인</button>
            <button
              onClick={() => { setMode("register"); setError(""); setSuccess(""); }}
              className={`flex-1 py-2 text-sm font-semibold transition-colors ${mode === "register" ? "bg-blue-600 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
            >회원가입</button>
          </div>

          {success && <p className="text-xs text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-4">{success}</p>}

          {mode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">아이디</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(""); }}
                  placeholder="아이디를 입력하세요"
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${error ? "border-red-400" : "border-gray-200"}`}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="비밀번호를 입력하세요"
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${error ? "border-red-400" : "border-gray-200"}`}
                />
              </div>
              {error && <p className="text-xs text-red-500">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60"
              >{submitting ? "확인 중..." : "로그인"}</button>
              <p className="text-xs text-center text-gray-300">초기 관리자: admin / admin1234</p>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">아이디</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(""); }}
                  placeholder="사용할 아이디"
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${error ? "border-red-400" : "border-gray-200"}`}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호 (6자 이상)</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="비밀번호"
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${error ? "border-red-400" : "border-gray-200"}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호 확인</label>
                <input
                  type="password"
                  value={password2}
                  onChange={(e) => { setPassword2(e.target.value); setError(""); }}
                  placeholder="비밀번호 재입력"
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${error ? "border-red-400" : "border-gray-200"}`}
                />
              </div>
              {error && <p className="text-xs text-red-500">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60"
              >{submitting ? "처리 중..." : "회원가입"}</button>
              <p className="text-xs text-center text-gray-400">가입 후 관리자가 사업장을 배정합니다.</p>
            </form>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
