"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type EmployeeReport = {
  employeeId: string;
  name?: Record<string, string>;
  department?: Record<string, string>;
  averageScore: number;
  responseCount: number;
};

type DailyReport = {
  date: string;
  averageScore: number;
  count: number;
};

type SupervisorReport = {
  employees: EmployeeReport[];
  daily: DailyReport[];
};

export default function SupervisorDashboard() {
  const router = useRouter();
  const [report, setReport] = useState<SupervisorReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const sessionRes = await fetch("/api/portal/me");
        if (!sessionRes.ok) {
          throw new Error("unauthorized");
        }
        const session = (await sessionRes.json()) as { role: string };
        if (session.role !== "supervisor") {
          throw new Error("unauthorized");
        }

        const res = await fetch("/api/reports/supervisor");
        if (!res.ok) {
          throw new Error("report");
        }
        const data = (await res.json()) as SupervisorReport;
        setReport(data);
      } catch {
        setError("دسترسی غیرمجاز است.");
      } finally {
        setLoading(false);
      }
    };
    load().catch(() => null);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/portal/logout", { method: "POST" });
    router.replace("/portal/login");
  };

  if (loading) {
    return (
      <main className="orbit min-h-screen px-6 py-12 text-[var(--ink)]">
        <div className="mx-auto max-w-5xl text-center text-sm text-[var(--muted)]">
          در حال بارگذاری...
        </div>
      </main>
    );
  }

  if (error || !report) {
    return (
      <main className="orbit min-h-screen px-6 py-12 text-[var(--ink)]">
        <div className="mx-auto max-w-5xl text-center text-sm text-rose-600">
          {error || "خطا در دریافت گزارش"}
        </div>
      </main>
    );
  }

  return (
    <main className="orbit min-h-screen px-6 py-10 text-[var(--ink)]">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <div className="surface rounded-[28px] p-8 sm:p-10">
          <div className="flex flex-col gap-3 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--accent)]">
              داشبورد سوپروایزر
            </p>
            <h1 className="text-3xl font-semibold">نمای کلی تیم</h1>
            <p className="text-sm text-[var(--muted)]">
              فقط اعضای تیم شما نمایش داده می‌شوند.
            </p>
          </div>
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-slate-200 px-6 py-2 text-sm font-semibold text-slate-700 hover:border-slate-900"
            >
              خروج
            </button>
          </div>
        </div>

        <div className="surface rounded-[28px] p-6">
          <h2 className="text-lg font-semibold">کارمندان تیم</h2>
          <div className="mt-4 grid gap-3">
            {report.employees.length ? (
              report.employees.map((emp) => (
                <div
                  key={emp.employeeId}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                >
                  <div>
                    <p className="font-semibold">
                      {emp.name?.fa ?? emp.employeeId}
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      {emp.department?.fa ?? ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{emp.averageScore.toFixed(2)}</p>
                    <p className="text-xs text-[var(--muted)]">
                      {emp.responseCount} پاسخ
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--muted)]">
                داده‌ای ثبت نشده است.
              </p>
            )}
          </div>
        </div>

        <div className="surface rounded-[28px] p-6">
          <h2 className="text-lg font-semibold">روند روزانه تیم</h2>
          <div className="mt-4 grid gap-2">
            {report.daily.length ? (
              report.daily.map((row) => (
                <div key={row.date} className="flex items-center gap-3 text-xs">
                  <span className="w-16 text-[var(--muted)]">{row.date}</span>
                  <div className="h-2 flex-1 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-[var(--accent-strong)]"
                      style={{ width: `${Math.min(row.averageScore * 10, 100)}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-[var(--muted)]">
                    {row.averageScore.toFixed(1)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--muted)]">
                داده‌ای ثبت نشده است.
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
