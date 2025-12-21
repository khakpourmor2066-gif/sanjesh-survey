"use client";

import { useEffect, useState } from "react";

type Employee = {
  id: string;
  name: Record<string, string>;
  department: Record<string, string>;
  active: boolean;
};

export default function QrAdmin() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [message, setMessage] = useState("");

  const load = async () => {
    const res = await fetch("/api/admin/employees");
    if (res.ok) {
      const data = (await res.json()) as { employees: Employee[] };
      setEmployees(data.employees);
    }
  };

  useEffect(() => {
    load().catch(() => null);
  }, []);

  const origin =
    typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

  const copyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setMessage("لینک کپی شد.");
      setTimeout(() => setMessage(""), 1500);
    } catch {
      setMessage("کپی انجام نشد.");
    }
  };

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
      <div className="rounded-3xl bg-white p-8 shadow">
        <h1 className="text-2xl font-semibold">مدیریت QR</h1>
        <p className="mt-2 text-sm text-slate-500">
          کد QR اختصاصی هر کارمند را مشاهده و لینک را کپی کنید.
        </p>
        {message ? (
          <p className="mt-3 text-sm font-medium text-emerald-600">{message}</p>
        ) : null}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {employees.map((employee) => {
          const url = `${origin}/fa/e/${employee.id}`;
          return (
            <div
              key={employee.id}
              className="rounded-3xl bg-white p-6 shadow"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                {employee.id}
              </p>
              <h2 className="mt-2 text-lg font-semibold">
                {employee.name.fa ?? employee.id}
              </h2>
              <p className="text-sm text-slate-500">
                {employee.department.fa ?? ""}
              </p>
              <div className="mt-4 flex items-center justify-between gap-4">
                <img
                  src={`/api/qr?data=${encodeURIComponent(url)}`}
                  alt={employee.id}
                  width={120}
                  height={120}
                  className="h-[120px] w-[120px] rounded-2xl bg-white p-2 shadow"
                />
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => copyLink(url)}
                    className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700"
                  >
                    کپی لینک
                  </button>
                  <span className="text-xs text-slate-400 break-all">
                    {url}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
