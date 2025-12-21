"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function AdminHeader() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  };

  const links = [
    { href: "/admin", label: "داشبورد" },
    { href: "/admin/employees", label: "کارمندان" },
    { href: "/admin/questions", label: "سوالات" },
    { href: "/admin/roles", label: "نقش‌ها" },
    { href: "/admin/qr", label: "QR" },
    { href: "/admin/reports", label: "گزارش‌ها" },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4">
        <div className="flex flex-wrap items-center gap-2">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                  active
                    ? "bg-slate-900 text-white"
                    : "border border-slate-200 text-slate-700 hover:border-slate-900"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:border-slate-900"
        >
          خروج
        </button>
      </div>
    </header>
  );
}
