"use client";

import Link from "next/link";
import { APP_NAME, NAV_ITEMS } from "@/lib/constants";
import { useAuth } from "@/lib/authStore";

export default function Header() {
  const { logout } = useAuth();

  return (
    <header className="bg-blue-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">
          {APP_NAME}
        </Link>
        <nav className="flex items-center gap-6">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium hover:text-blue-200 transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <button
            onClick={logout}
            className="text-sm font-medium text-blue-200 hover:text-white transition-colors border border-blue-400 hover:border-white px-3 py-1 rounded-lg"
          >
            로그아웃
          </button>
        </nav>
      </div>
    </header>
  );
}
