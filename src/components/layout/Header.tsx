"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_NAME } from "@/lib/constants";
import { useAuth } from "@/lib/authStore";

const ALL_NAV = [
  { label: "자산 현황", href: "/inventory" },
  { label: "유형자산", href: "/assets" },
  { label: "렌트 현황", href: "/rentals" },
  { label: "지사 관리", href: "/branches", adminOnly: true },
  { label: "설정", href: "/settings", adminOnly: true },
];

export default function Header() {
  const { logout, currentUser, isAdmin } = useAuth();
  const pathname = usePathname();

  const navItems = ALL_NAV.filter((item) => !item.adminOnly || isAdmin);

  return (
    <header className="bg-blue-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">
          {APP_NAME}
        </Link>
        <nav className="flex items-center gap-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors ${
                pathname?.startsWith(item.href)
                  ? "text-white underline underline-offset-4"
                  : "text-blue-200 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <div className="flex items-center gap-2 pl-4 border-l border-blue-500">
            <div className="text-right">
              <p className="text-xs font-semibold text-white">{currentUser?.username}</p>
              <p className="text-xs text-blue-300">{isAdmin ? "관리자" : "일반 사용자"}</p>
            </div>
            <button
              onClick={logout}
              className="text-sm font-medium text-blue-200 hover:text-white transition-colors border border-blue-400 hover:border-white px-3 py-1 rounded-lg"
            >
              로그아웃
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
