"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { getDictionary, type Lang } from "@/lib/i18n";

type Employee = {
  id: string;
  name: Record<string, string>;
  department: Record<string, string>;
};

type DailyPoint = {
  date: string;
  averageScore: number;
  count: number;
};

type FeedbackItem = {
  text: string;
  date: string;
};

type ReportPayload = {
  employee: Employee;
  averageScore: number;
  responseCount: number;
  daily: DailyPoint[];
  feedback: FeedbackItem[];
  lastResponseAt?: string | null;
};

export default function EmployeeDashboard({
  params,
}: {
  params: Promise<{ lang: Lang; employeeId: string }>;
}) {
  const { lang, employeeId } = use(params);
  const t = getDictionary(lang);
  const [report, setReport] = useState<ReportPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(
          `/api/reports/employee?employeeId=${encodeURIComponent(employeeId)}`
        );
        if (!res.ok) {
          throw new Error("report");
        }
        const data = (await res.json()) as ReportPayload;
        setReport(data);
      } catch {
        setError(t.problem);
      } finally {
        setLoading(false);
      }
    };
    load().catch(() => null);
  }, [employeeId, t.problem]);

  if (loading) {
    return (
      <main className="orbit min-h-screen px-6 py-10 text-[var(--ink)]">
        <div className="mx-auto max-w-4xl text-center text-sm text-[var(--muted)]">
          {t.redirecting}
        </div>
      </main>
    );
  }

  if (error || !report) {
    return (
      <main className="orbit min-h-screen px-6 py-10 text-[var(--ink)]">
        <div className="mx-auto max-w-4xl text-center text-sm text-rose-600">
          {error || t.problem}
        </div>
      </main>
    );
  }

  const name =
    report.employee.name[lang] ??
    report.employee.name.fa ??
    report.employee.name.en ??
    report.employee.id;
  const department =
    report.employee.department[lang] ??
    report.employee.department.fa ??
    report.employee.department.en ??
    "";

  return (
    <main className="orbit min-h-screen px-6 py-10 text-[var(--ink)]">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <div className="surface rounded-[28px] p-8 sm:p-10">
          <div className="flex flex-col gap-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--accent)]">
              {t.employeeDashboard}
            </p>
            <h1 className="text-3xl font-semibold">{name}</h1>
            {department ? (
              <p className="text-sm text-[var(--muted)]">{department}</p>
            ) : null}
            <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs text-[var(--muted)]">
              <span>{report.employee.id}</span>
              {report.lastResponseAt ? (
                <span>
                  {t.lastResponse}: {report.lastResponseAt.slice(0, 10)}
                </span>
              ) : null}
            </div>
          </div>
          <div className="mt-6 flex justify-center">
            <Link
              href={`/${lang}`}
              className="rounded-full border border-slate-200 px-6 py-2 text-sm font-semibold text-slate-700 hover:border-slate-900"
            >
              {t.backHome}
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="surface rounded-[22px] p-6">
            <p className="text-xs text-[var(--muted)]">{t.averageScore}</p>
            <p className="mt-3 text-3xl font-semibold">
              {report.averageScore.toFixed(2)}
            </p>
          </div>
          <div className="surface rounded-[22px] p-6">
            <p className="text-xs text-[var(--muted)]">{t.totalResponses}</p>
            <p className="mt-3 text-3xl font-semibold">
              {report.responseCount}
            </p>
          </div>
          <div className="surface rounded-[22px] p-6">
            <p className="text-xs text-[var(--muted)]">{t.lastResponse}</p>
            <p className="mt-3 text-lg font-semibold">
              {report.lastResponseAt
                ? report.lastResponseAt.slice(0, 10)
                : "—"}
            </p>
          </div>
        </div>

        <div className="surface rounded-[28px] p-6">
          <h2 className="text-lg font-semibold">{t.trendTitle}</h2>
          {report.daily.length ? (
            <div className="mt-4 grid gap-2">
              {report.daily.map((row) => (
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
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-[var(--muted)]">
              {t.noFeedback}
            </p>
          )}
        </div>

        <div className="surface rounded-[28px] p-6">
          <h2 className="text-lg font-semibold">{t.recentFeedback}</h2>
          <div className="mt-4 grid gap-3">
            {report.feedback.length ? (
              report.feedback.map((item, index) => (
                <div
                  key={`${item.date}-${index}`}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                >
                  <p className="text-xs text-[var(--muted)]">{item.date}</p>
                  <p className="mt-2">{item.text}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--muted)]">{t.noFeedback}</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
