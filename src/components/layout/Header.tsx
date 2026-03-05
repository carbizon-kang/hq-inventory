import Link from "next/link";
import { APP_NAME, NAV_ITEMS } from "@/lib/constants";

export default function Header() {
  return (
    <header className="bg-blue-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">
          {APP_NAME}
        </Link>
        <nav className="flex gap-6">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium hover:text-blue-200 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
