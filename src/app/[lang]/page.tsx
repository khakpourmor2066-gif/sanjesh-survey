"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { getDictionary, type Lang } from "@/lib/i18n";
import Link from "next/link";

type Employee = {
  id: string;
  name: Record<string, string>;
  department: Record<string, string>;
};

export default function Home({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = use(params);
  const t = getDictionary(lang);
  const router = useRouter();
  const [employeeId, setEmployeeId] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const res = await fetch("/api/survey/employees");
        const data = (await res.json()) as { employees: Employee[] };
        setEmployees(data.employees);
      } finally {
        setLoading(false);
      }
    };
    loadEmployees();
  }, []);

  const submit = () => {
    const target = selectedEmployee || employeeId.trim();
    if (!target) {
      setError(t.invalidEmployee);
      return;
    }
    router.push(`/${lang}/e/${encodeURIComponent(target)}`);
  };

  const loginDirect = () => {
    const target = selectedEmployee || employeeId.trim();
    if (!target) {
      setError(t.invalidEmployee);
      return;
    }
    router.push(`/${lang}/auth?employeeId=${encodeURIComponent(target)}`);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-12 text-[var(--ink)]">
      <div className="mx-auto flex max-w-lg flex-col items-center justify-center">
        <div className="surface w-full rounded-[28px] p-8 sm:p-10">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent)]/10 text-[var(--accent-strong)]">
              <span className="text-lg font-semibold">QR</span>
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.35em] text-[var(--accent)]">
              {t.welcome}
            </p>
            <h1 className="mt-3 text-2xl font-semibold sm:text-3xl">
              {t.title}
            </h1>
            <p className="mt-2 text-sm text-[var(--muted)]">{t.subtitle}</p>
          </div>

          <div className="mt-6 flex flex-col items-center gap-3">
            <p className="text-center text-xs text-[var(--muted)]">
              {t.selectLanguage}
            </p>
            <LanguageSwitcher lang={lang} />
          </div>

          <div className="mt-6 rounded-2xl bg-slate-100 px-4 py-3 text-center text-sm text-slate-600">
            {t.scanQr}
          </div>

          <div className="mt-6 space-y-3">
            <p className="text-center text-xs text-[var(--muted)]">
              {t.selectEmployee}
            </p>
            {loading ? (
              <div className="text-center text-xs text-[var(--muted)]">
                {t.redirecting}
              </div>
            ) : employees.length === 0 ? (
              <div className="text-center text-xs text-[var(--muted)]">
                {t.noEmployees}
              </div>
            ) : (
              <div className="max-h-64 space-y-2 overflow-y-auto">
                {employees.map((employee) => {
                  const name =
                    employee.name[lang] ??
                    employee.name.fa ??
                    employee.name.en ??
                    employee.id;
                  const department =
                    employee.department[lang] ??
                    employee.department.fa ??
                    employee.department.en ??
                    "";
                  const isSelected = selectedEmployee === employee.id;
                  return (
                    <button
                      type="button"
                      key={employee.id}
                      onClick={() => {
                        setSelectedEmployee(employee.id);
                        setEmployeeId("");
                      }}
                      className={`w-full rounded-2xl border px-4 py-3 text-start text-sm transition ${
                        isSelected
                          ? "border-[var(--accent-strong)] bg-[var(--accent)]/5"
                          : "border-slate-200 hover:border-slate-400"
                      }`}
                    >
                      <p className="font-semibold text-[var(--ink)]">{name}</p>
                      {department ? (
                        <p className="text-xs text-[var(--muted)]">
                          {department}
                        </p>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-6 space-y-3">
            <p className="text-center text-xs text-[var(--muted)]">
              {t.startWithQr}
            </p>
            <input
              value={employeeId}
              onChange={(event) => {
                setEmployeeId(event.target.value);
                setSelectedEmployee("");
                setError("");
              }}
              placeholder={t.employeeCode}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-900"
            />
          </div>

          {error ? (
            <p className="mt-3 text-center text-sm font-medium text-rose-600">
              {error}
            </p>
          ) : null}

          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={submit}
              className="w-full rounded-full bg-[var(--accent-strong)] px-6 py-3 text-sm font-semibold text-white shadow hover:brightness-110"
            >
              {t.startSurvey}
            </button>
            <button
              type="button"
              onClick={loginDirect}
              className="w-full rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 hover:border-slate-900"
            >
              {t.login}
            </button>
          </div>

          <div className="mt-6 flex items-center justify-between rounded-[18px] border border-dashed border-slate-200 bg-white/60 px-4 py-3 text-xs text-[var(--muted)]">
            <span>{t.employeesTitle}</span>
            <Link
              href={`/${lang}/employees`}
              className="rounded-full border border-slate-200 px-4 py-2 text-[11px] font-semibold text-slate-700 hover:border-slate-900"
            >
              {t.viewEmployees}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
