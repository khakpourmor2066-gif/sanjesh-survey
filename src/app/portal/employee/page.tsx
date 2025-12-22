"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EmployeePortalRedirect() {
  const router = useRouter();

  useEffect(() => {
    const go = async () => {
      const res = await fetch("/api/portal/me");
      if (!res.ok) {
        router.replace("/portal/login");
        return;
      }
      const data = (await res.json()) as { role: string; employeeId?: string };
      if (data.role !== "employee" || !data.employeeId) {
        router.replace("/portal/login");
        return;
      }
      router.replace(`/fa/employee/${encodeURIComponent(data.employeeId)}`);
    };
    go().catch(() => router.replace("/portal/login"));
  }, [router]);

  return (
    <main className="orbit min-h-screen px-6 py-12 text-[var(--ink)]">
      <div className="mx-auto max-w-md text-center text-sm text-[var(--muted)]">
        در حال انتقال به داشبورد...
      </div>
    </main>
  );
}
