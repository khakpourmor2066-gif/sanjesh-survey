"use client";

import { useEffect, useState } from "react";

type EmployeeReport = {
  employeeId: string;
  name?: Record<string, string>;
  department?: Record<string, string>;
  averageScore: number;
  responseCount: number;
  lastResponseAt?: string | null;
};

type QuestionReport = {
  questionId: string;
  text?: Record<string, string>;
  type?: string;
  averageScore: number;
  count: number;
};

type DailyReport = {
  date: string;
  averageScore: number;
  count: number;
};

type User = {
  id: string;
  name: string;
  role: string;
};

export default function ReportsAdmin() {
  const [manager, setManager] = useState<{
    employees: EmployeeReport[];
    questions: QuestionReport[];
    daily: DailyReport[];
  } | null>(null);
  const [supervisor, setSupervisor] = useState<{
    employees: EmployeeReport[];
    daily: DailyReport[];
  } | null>(null);
  const [supervisors, setSupervisors] = useState<User[]>([]);
  const [selectedSupervisor, setSelectedSupervisor] = useState("");
  const [exportMessage, setExportMessage] = useState("");

  useEffect(() => {
    const loadManager = async () => {
      const res = await fetch("/api/reports/manager");
      if (res.ok) {
        const data = await res.json();
        setManager(data);
      }
    };
    const loadSupervisors = async () => {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = (await res.json()) as { users: User[] };
        setSupervisors(data.users.filter((user) => user.role === "supervisor"));
      }
    };
    loadManager().catch(() => null);
    loadSupervisors().catch(() => null);
  }, []);

  useEffect(() => {
    if (!selectedSupervisor) {
      setSupervisor(null);
      return;
    }
    const loadSupervisor = async () => {
      const res = await fetch(
        `/api/reports/supervisor?supervisorId=${encodeURIComponent(
          selectedSupervisor
        )}`
      );
      if (res.ok) {
        const data = await res.json();
        setSupervisor(data);
      }
    };
    loadSupervisor().catch(() => null);
  }, [selectedSupervisor]);

  const downloadCsv = (filename: string, rows: string[][]) => {
    const content = rows
      .map((row) =>
        row
          .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportManager = () => {
    if (!manager) return;
    const employeeRows = [
      ["employeeId", "name_fa", "department_fa", "averageScore", "responseCount"],
      ...manager.employees.map((emp) => [
        emp.employeeId,
        emp.name?.fa ?? "",
        emp.department?.fa ?? "",
        emp.averageScore.toFixed(2),
        String(emp.responseCount),
      ]),
    ];
    const questionRows = [
      ["questionId", "text_fa", "type", "averageScore", "count"],
      ...manager.questions.map((q) => [
        q.questionId,
        q.text?.fa ?? "",
        q.type ?? "",
        q.averageScore.toFixed(2),
        String(q.count),
      ]),
    ];
    const dailyRows = [
      ["date", "averageScore", "count"],
      ...manager.daily.map((d) => [
        d.date,
        d.averageScore.toFixed(2),
        String(d.count),
      ]),
    ];
    downloadCsv("manager_employees.csv", employeeRows);
    downloadCsv("manager_questions.csv", questionRows);
    downloadCsv("manager_daily.csv", dailyRows);
    setExportMessage("فایل‌های CSV گزارش مدیریتی دانلود شد.");
    setTimeout(() => setExportMessage(""), 2000);
  };

  const exportSupervisor = () => {
    if (!supervisor) return;
    const employeeRows = [
      ["employeeId", "name_fa", "department_fa", "averageScore", "responseCount"],
      ...supervisor.employees.map((emp) => [
        emp.employeeId,
        emp.name?.fa ?? "",
        emp.department?.fa ?? "",
        emp.averageScore.toFixed(2),
        String(emp.responseCount),
      ]),
    ];
    const dailyRows = [
      ["date", "averageScore", "count"],
      ...supervisor.daily.map((d) => [
        d.date,
        d.averageScore.toFixed(2),
        String(d.count),
      ]),
    ];
    downloadCsv("supervisor_employees.csv", employeeRows);
    downloadCsv("supervisor_daily.csv", dailyRows);
    setExportMessage("فایل‌های CSV گزارش سوپروایزر دانلود شد.");
    setTimeout(() => setExportMessage(""), 2000);
  };

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
      <div className="rounded-3xl bg-white p-8 shadow">
        <h1 className="text-2xl font-semibold">گزارش‌های مدیریتی</h1>
        <p className="mt-2 text-sm text-slate-500">
          خلاصه عملکرد سازمان و میانگین امتیازها.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={exportManager}
            className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:border-slate-900"
          >
            خروجی CSV مدیریت
          </button>
          {selectedSupervisor ? (
            <button
              type="button"
              onClick={exportSupervisor}
              className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:border-slate-900"
            >
              خروجی CSV سوپروایزر
            </button>
          ) : null}
          {exportMessage ? (
            <span className="text-xs text-emerald-600">{exportMessage}</span>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow">
          <h2 className="text-lg font-semibold">کارمندان برتر/ضعیف</h2>
          <div className="mt-4 space-y-3">
            {manager?.employees.length ? (
              manager.employees.map((emp) => (
                <div
                  key={emp.employeeId}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                >
                  <div>
                    <p className="font-semibold">
                      {emp.name?.fa ?? emp.employeeId}
                    </p>
                    <p className="text-xs text-slate-500">
                      {emp.department?.fa ?? ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {emp.averageScore.toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {emp.responseCount} پاسخ
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">داده‌ای ثبت نشده است.</p>
            )}
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow">
          <h2 className="text-lg font-semibold">میانگین روزانه</h2>
          <div className="mt-4 space-y-3">
            {manager?.daily.length ? (
              manager.daily.map((row) => (
                <div
                  key={row.date}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                >
                  <span>{row.date}</span>
                  <span className="font-semibold">
                    {row.averageScore.toFixed(2)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">داده‌ای ثبت نشده است.</p>
            )}
          </div>
          {manager?.daily.length ? (
            <div className="mt-6 grid gap-2">
              {manager.daily.map((row) => (
                <div key={row.date} className="flex items-center gap-3 text-xs">
                  <span className="w-16 text-slate-500">{row.date}</span>
                  <div className="h-2 flex-1 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-slate-900"
                      style={{ width: `${Math.min(row.averageScore * 10, 100)}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-slate-500">
                    {row.averageScore.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow">
        <h2 className="text-lg font-semibold">گزارش سوالات</h2>
        <div className="mt-4 grid gap-3">
          {manager?.questions.length ? (
            manager.questions.map((q) => (
              <div
                key={q.questionId}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              >
                <p className="font-semibold">{q.text?.fa ?? q.questionId}</p>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>{q.type}</span>
                  <span>میانگین: {q.averageScore.toFixed(2)}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">داده‌ای ثبت نشده است.</p>
          )}
        </div>
      </div>

      <div className="rounded-3xl bg-white p-8 shadow">
        <h2 className="text-xl font-semibold">گزارش سوپروایزر</h2>
        <p className="mt-2 text-sm text-slate-500">
          انتخاب سوپروایزر برای مشاهده عملکرد تیم.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            value={selectedSupervisor}
            onChange={(event) => setSelectedSupervisor(event.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
          >
            <option value="">انتخاب سوپروایزر</option>
            {supervisors.map((supervisor) => (
              <option key={supervisor.id} value={supervisor.id}>
                {supervisor.name}
              </option>
            ))}
          </select>
        </div>

        {selectedSupervisor ? (
          <div className="mt-6 grid gap-4">
            {supervisor?.employees.length ? (
              supervisor.employees.map((emp) => (
                <div
                  key={emp.employeeId}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                >
                  <div>
                    <p className="font-semibold">
                      {emp.name?.fa ?? emp.employeeId}
                    </p>
                    <p className="text-xs text-slate-500">
                      {emp.department?.fa ?? ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {emp.averageScore.toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {emp.responseCount} پاسخ
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">داده‌ای ثبت نشده است.</p>
            )}
            {supervisor?.daily.length ? (
              <div className="mt-4 grid gap-2">
                {supervisor.daily.map((row) => (
                  <div key={row.date} className="flex items-center gap-3 text-xs">
                    <span className="w-16 text-slate-500">{row.date}</span>
                    <div className="h-2 flex-1 rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-slate-900"
                        style={{ width: `${Math.min(row.averageScore * 10, 100)}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-slate-500">
                      {row.averageScore.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </main>
  );
}
