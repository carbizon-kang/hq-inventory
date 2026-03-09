"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "./supabase";

interface AuthContextType {
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  changePassword: (oldPw: string, newPw: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const SESSION_KEY = "hq_wv_session";
const SESSION_HOURS = 8; // 8시간 세션 유지

// SHA-256 해시 함수 (Web Crypto API)
async function hashPassword(password: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 세션 확인
    const session = localStorage.getItem(SESSION_KEY);
    if (session) {
      try {
        const { expiry } = JSON.parse(session);
        if (Date.now() < expiry) {
          setIsLoggedIn(true);
        } else {
          localStorage.removeItem(SESSION_KEY);
        }
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }
    }
    // 최초 비밀번호 초기화 (기본값: admin1234)
    initPassword().finally(() => setIsLoading(false));
  }, []);

  async function initPassword() {
    const { data } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "password_hash")
      .single();
    if (!data) {
      const defaultHash = await hashPassword("admin1234");
      await supabase.from("app_settings").insert({ key: "password_hash", value: defaultHash });
    }
  }

  async function login(password: string): Promise<boolean> {
    const { data } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "password_hash")
      .single();
    if (!data) return false;
    const hash = await hashPassword(password);
    if (hash === data.value) {
      const expiry = Date.now() + SESSION_HOURS * 60 * 60 * 1000;
      localStorage.setItem(SESSION_KEY, JSON.stringify({ expiry }));
      setIsLoggedIn(true);
      return true;
    }
    return false;
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    setIsLoggedIn(false);
  }

  async function changePassword(oldPw: string, newPw: string) {
    const { data } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "password_hash")
      .single();
    if (!data) throw new Error("비밀번호 정보를 불러올 수 없습니다.");
    const oldHash = await hashPassword(oldPw);
    if (oldHash !== data.value) throw new Error("현재 비밀번호가 일치하지 않습니다.");
    const newHash = await hashPassword(newPw);
    const { error } = await supabase
      .from("app_settings")
      .update({ value: newHash })
      .eq("key", "password_hash");
    if (error) throw new Error(`비밀번호 변경 실패: ${error.message}`);
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, isLoading, login, logout, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
