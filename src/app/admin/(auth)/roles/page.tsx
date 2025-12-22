"use client";

import { useEffect, useState } from "react";

type User = {
  id: string;
  name: string;
  role: "admin" | "supervisor" | "employee";
  employeeId?: string;
};

type Employee = {
  id: string;
  name: Record<string, string>;
};

export default function RolesAdmin() {
  const [users, setUsers] = useState<User[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [form, setForm] = useState({
    name: "",
    role: "supervisor" as User["role"],
    employeeId: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [usersRes, empRes] = await Promise.all([
      fetch("/api/admin/users"),
      fetch("/api/admin/employees"),
    ]);
    if (usersRes.ok) {
      const data = (await usersRes.json()) as { users: User[] };
      setUsers(data.users);
    }
    if (empRes.ok) {
      const data = (await empRes.json()) as { employees: Employee[] };
      setEmployees(data.employees);
    }
    setLoading(false);
  };

  useEffect(() => {
    load().catch(() => null);
  }, []);

  const canSubmit = form.name.trim().length > 0;

  const addUser = async () => {
    setMessage("");
    const response = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        role: form.role,
        employeeId: form.employeeId || undefined,
      }),
    });
    if (response.ok) {
      setMessage("کاربر جدید اضافه شد.");
      setForm({ name: "", role: "supervisor", employeeId: "" });
      load().catch(() => null);
    } else {
      setMessage("خطا در ثبت کاربر.");
    }
  };

  const updateUser = async (user: User) => {
    const response = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: user.id,
        updates: {
          name: user.name,
          role: user.role,
          employeeId: user.employeeId,
        },
      }),
    });
    if (response.ok) {
      setMessage("تغییرات ذخیره شد.");
      load().catch(() => null);
    } else {
      setMessage("خطا در ذخیره تغییرات.");
    }
  };

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-10">
      <div className="rounded-3xl bg-white p-8 shadow">
        <h1 className="text-2xl font-semibold">مدیریت نقش‌ها</h1>
        <p className="mt-2 text-sm text-slate-500">
          ساخت نقش‌های سوپروایزر و تخصیص کارمند مرتبط.
        </p>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <input
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            placeholder="نام کاربر"
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
          />
          <select
            value={form.role}
            onChange={(event) =>
              setForm({
                ...form,
                role: event.target.value as User["role"],
              })
            }
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
          >
            <option value="admin">ادمین</option>
            <option value="supervisor">سوپروایزر</option>
            <option value="employee">کارمند</option>
          </select>
          <select
            value={form.employeeId}
            onChange={(event) =>
              setForm({ ...form, employeeId: event.target.value })
            }
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
          >
            <option value="">بدون کارمند</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name.fa ?? employee.id}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={addUser}
          disabled={!canSubmit}
          className="mt-4 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          افزودن کاربر
        </button>
        {message ? (
          <p className="mt-3 text-sm font-medium text-emerald-600">{message}</p>
        ) : null}
      </div>

      <div className="rounded-3xl bg-white p-8 shadow">
        <h2 className="text-xl font-semibold">لیست نقش‌ها</h2>
        <div className="mt-6 grid gap-4">
          {loading ? (
            <p className="text-sm text-slate-500">در حال بارگذاری...</p>
          ) : users.length === 0 ? (
            <p className="text-sm text-slate-500">
              هنوز کاربری ثبت نشده است.
            </p>
          ) : (
            users.map((user) => (
            <div
              key={user.id}
              className="rounded-2xl border border-slate-200 p-4"
            >
              <div className="flex flex-wrap items-center gap-3">
                <input
                  value={user.name}
                  onChange={(event) => {
                    setUsers((prev) =>
                      prev.map((item) =>
                        item.id === user.id
                          ? { ...item, name: event.target.value }
                          : item
                      )
                    );
                  }}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-xs"
                />
                <select
                  value={user.role}
                  onChange={(event) => {
                    setUsers((prev) =>
                      prev.map((item) =>
                        item.id === user.id
                          ? {
                              ...item,
                              role: event.target.value as User["role"],
                            }
                          : item
                      )
                    );
                  }}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-xs"
                >
                  <option value="admin">ادمین</option>
                  <option value="supervisor">سوپروایزر</option>
                  <option value="employee">کارمند</option>
                </select>
                <select
                  value={user.employeeId ?? ""}
                  onChange={(event) => {
                    setUsers((prev) =>
                      prev.map((item) =>
                        item.id === user.id
                          ? {
                              ...item,
                              employeeId: event.target.value || undefined,
                            }
                          : item
                      )
                    );
                  }}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-xs"
                >
                  <option value="">بدون کارمند</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name.fa ?? employee.id}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => updateUser(user)}
                  className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
                >
                  ذخیره
                </button>
              </div>
            </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
