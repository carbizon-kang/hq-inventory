"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "./supabase";

async function hashPassword(password: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export interface AppUser {
  id: string;
  username: string;
  role: "admin" | "user";
  branchId: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  currentUser: AppUser | null;
  users: AppUser[];
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (username: string, password: string) => Promise<void>;
  changePassword: (oldPw: string, newPw: string) => Promise<void>;
  updateUser: (id: string, data: { role?: "admin" | "user"; branchId?: string }) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);
const SESSION_KEY = "hq_session_v2";
const SESSION_HOURS = 8;

function rowToUser(r: Record<string, unknown>): AppUser {
  return {
    id: r.id as string,
    username: r.username as string,
    role: (r.role as "admin" | "user") || "user",
    branchId: (r.branch_id as string) || "",
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [users, setUsers] = useState<AppUser[]>([]);

  useEffect(() => {
    const session = localStorage.getItem(SESSION_KEY);
    if (session) {
      try {
        const { user, expiry } = JSON.parse(session);
        if (Date.now() < expiry && user) {
          setCurrentUser(user);
          setIsLoggedIn(true);
        } else {
          localStorage.removeItem(SESSION_KEY);
        }
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }
    }
    loadUsers().finally(() => setIsLoading(false));
  }, []);

  async function loadUsers() {
    const { data } = await supabase.from("users").select("*").order("created_at");
    if (data) setUsers(data.map(rowToUser));
  }

  async function login(username: string, password: string) {
    const hash = await hashPassword(password);

    // 1. users 테이블에서 시도
    const { data: allUsers } = await supabase.from("users").select("*");
    if (allUsers && allUsers.length > 0) {
      const found = allUsers.find(
        (u) => u.username === username && u.password_hash === hash
      );
      if (!found) throw new Error("아이디 또는 비밀번호가 올바르지 않습니다.");
      const user = rowToUser(found as Record<string, unknown>);
      const expiry = Date.now() + SESSION_HOURS * 60 * 60 * 1000;
      localStorage.setItem(SESSION_KEY, JSON.stringify({ user, expiry }));
      setCurrentUser(user);
      setIsLoggedIn(true);
      await loadUsers();
      return;
    }

    // 2. 폴백: app_settings (기존 관리자 계정 자동 마이그레이션)
    if (username === "admin") {
      const { data: setting } = await supabase
        .from("app_settings").select("value").eq("key", "password_hash").single();
      if (setting && setting.value === hash) {
        // 자동으로 admin 계정 생성
        const id = `user${Date.now()}`;
        await supabase.from("users").insert({
          id, username: "admin", password_hash: hash, role: "admin", branch_id: "",
        });
        const user: AppUser = { id, username: "admin", role: "admin", branchId: "" };
        const expiry = Date.now() + SESSION_HOURS * 60 * 60 * 1000;
        localStorage.setItem(SESSION_KEY, JSON.stringify({ user, expiry }));
        setCurrentUser(user);
        setIsLoggedIn(true);
        await loadUsers();
        return;
      }
    }
    throw new Error("아이디 또는 비밀번호가 올바르지 않습니다.");
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    setIsLoggedIn(false);
    setCurrentUser(null);
  }

  async function register(username: string, password: string) {
    if (!username.trim()) throw new Error("아이디를 입력해 주세요.");
    if (password.length < 6) throw new Error("비밀번호는 6자 이상이어야 합니다.");
    const { data: existing } = await supabase.from("users").select("id").eq("username", username).single();
    if (existing) throw new Error("이미 사용 중인 아이디입니다.");
    const hash = await hashPassword(password);
    const id = `user${Date.now()}`;
    const { error } = await supabase.from("users").insert({
      id, username: username.trim(), password_hash: hash, role: "user", branch_id: "",
    });
    if (error) throw new Error(`회원가입 실패: ${error.message}`);
    await loadUsers();
  }

  async function changePassword(oldPw: string, newPw: string) {
    if (!currentUser) throw new Error("로그인이 필요합니다.");
    const { data } = await supabase.from("users").select("password_hash").eq("id", currentUser.id).single();
    if (!data) throw new Error("사용자 정보를 불러올 수 없습니다.");
    const oldHash = await hashPassword(oldPw);
    if (oldHash !== data.password_hash) throw new Error("현재 비밀번호가 일치하지 않습니다.");
    const newHash = await hashPassword(newPw);
    const { error } = await supabase.from("users").update({ password_hash: newHash }).eq("id", currentUser.id);
    if (error) throw new Error(`비밀번호 변경 실패: ${error.message}`);
  }

  async function updateUser(id: string, data: { role?: "admin" | "user"; branchId?: string }) {
    const row: Record<string, unknown> = {};
    if (data.role !== undefined) row.role = data.role;
    if (data.branchId !== undefined) row.branch_id = data.branchId;
    const { error } = await supabase.from("users").update(row).eq("id", id);
    if (error) throw new Error(`수정 실패: ${error.message}`);
    await loadUsers();
  }

  async function deleteUser(id: string) {
    const { error } = await supabase.from("users").delete().eq("id", id);
    if (error) throw new Error(`삭제 실패: ${error.message}`);
    await loadUsers();
  }

  const isAdmin = currentUser?.role === "admin";

  return (
    <AuthContext.Provider value={{
      isLoggedIn, isLoading, isAdmin, currentUser, users,
      login, logout, register, changePassword, updateUser, deleteUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
