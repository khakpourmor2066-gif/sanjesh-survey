"use client";

import { useEffect, useState } from "react";

type Employee = {
  id: string;
  name: Record<string, string>;
  department: Record<string, string>;
  active: boolean;
  supervisorId?: string;
};

type User = {
  id: string;
  name: string;
  role: string;
};

const emptyEmployee = {
  id: "",
  name: { fa: "", en: "", ar: "" },
  department: { fa: "", en: "", ar: "" },
};

export default function EmployeesAdmin() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState(emptyEmployee);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [empRes, userRes] = await Promise.all([
      fetch("/api/admin/employees"),
      fetch("/api/admin/users"),
    ]);
    if (empRes.ok) {
      const data = (await empRes.json()) as { employees: Employee[] };
      setEmployees(data.employees);
    }
    if (userRes.ok) {
      const data = (await userRes.json()) as { users: User[] };
      setUsers(data.users);
    }
    setLoading(false);
  };

  useEffect(() => {
    load().catch(() => null);
  }, []);

  const supervisors = users.filter((user) => user.role === "supervisor");
  const canSubmit =
    form.name.fa.trim().length > 0 && form.department.fa.trim().length > 0;

  const addEmployee = async () => {
    setMessage("");
    const response = await fetch("/api/admin/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: form.id || undefined,
        name: form.name,
        department: form.department,
      }),
    });
    if (response.ok) {
      setForm(emptyEmployee);
      setMessage("کارمند جدید اضافه شد.");
      load().catch(() => null);
    } else {
      setMessage("خطا در ثبت کارمند.");
    }
  };

  const updateEmployee = async (employee: Employee) => {
    const response = await fetch("/api/admin/employees", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: employee.id,
        updates: {
          name: employee.name,
          department: employee.department,
          active: employee.active,
          supervisorId: employee.supervisorId,
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
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
      <div className="rounded-3xl bg-white p-8 shadow">
        <h1 className="text-2xl font-semibold">مدیریت کارمندان</h1>
        <p className="mt-2 text-sm text-slate-500">
          اضافه کردن، ویرایش و تخصیص سوپروایزر به کارمندان.
        </p>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <input
            value={form.id}
            onChange={(event) => setForm({ ...form, id: event.target.value })}
            placeholder="شناسه کارمند (اختیاری)"
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
          />
          <div />
          <input
            value={form.name.fa}
            onChange={(event) =>
              setForm({ ...form, name: { ...form.name, fa: event.target.value } })
            }
            placeholder="نام فارسی"
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
          />
          <input
            value={form.name.en}
            onChange={(event) =>
              setForm({ ...form, name: { ...form.name, en: event.target.value } })
            }
            placeholder="نام انگلیسی"
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
          />
          <input
            value={form.name.ar}
            onChange={(event) =>
              setForm({ ...form, name: { ...form.name, ar: event.target.value } })
            }
            placeholder="نام عربی"
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
          />
          <input
            value={form.department.fa}
            onChange={(event) =>
              setForm({
                ...form,
                department: { ...form.department, fa: event.target.value },
              })
            }
            placeholder="دپارتمان فارسی"
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
          />
          <input
            value={form.department.en}
            onChange={(event) =>
              setForm({
                ...form,
                department: { ...form.department, en: event.target.value },
              })
            }
            placeholder="دپارتمان انگلیسی"
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
          />
          <input
            value={form.department.ar}
            onChange={(event) =>
              setForm({
                ...form,
                department: { ...form.department, ar: event.target.value },
              })
            }
            placeholder="دپارتمان عربی"
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
          />
        </div>
        <button
          type="button"
          onClick={addEmployee}
          disabled={!canSubmit}
          className="mt-4 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          افزودن کارمند
        </button>
        {message ? (
          <p className="mt-3 text-sm font-medium text-emerald-600">{message}</p>
        ) : null}
      </div>

      <div className="rounded-3xl bg-white p-8 shadow">
        <h2 className="text-xl font-semibold">لیست کارمندان</h2>
        <div className="mt-6 grid gap-6">
          {loading ? (
            <p className="text-sm text-slate-500">در حال بارگذاری...</p>
          ) : employees.length === 0 ? (
            <p className="text-sm text-slate-500">
              هنوز کارمندی ثبت نشده است.
            </p>
          ) : (
            employees.map((employee) => (
            <div
              key={employee.id}
              className="rounded-2xl border border-slate-200 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold">{employee.id}</p>
                <label className="flex items-center gap-2 text-xs text-slate-500">
                  <input
                    type="checkbox"
                    checked={employee.active}
                    onChange={(event) => {
                      const updated = employees.map((item) =>
                        item.id === employee.id
                          ? { ...item, active: event.target.checked }
                          : item
                      );
                      setEmployees(updated);
                    }}
                  />
                  فعال
                </label>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <input
                  value={employee.name.fa ?? ""}
                  onChange={(event) => {
                    setEmployees((prev) =>
                      prev.map((item) =>
                        item.id === employee.id
                          ? {
                              ...item,
                              name: { ...item.name, fa: event.target.value },
                            }
                          : item
                      )
                    );
                  }}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-xs"
                  placeholder="نام فارسی"
                />
                <input
                  value={employee.name.en ?? ""}
                  onChange={(event) => {
                    setEmployees((prev) =>
                      prev.map((item) =>
                        item.id === employee.id
                          ? {
                              ...item,
                              name: { ...item.name, en: event.target.value },
                            }
                          : item
                      )
                    );
                  }}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-xs"
                  placeholder="نام انگلیسی"
                />
                <input
                  value={employee.name.ar ?? ""}
                  onChange={(event) => {
                    setEmployees((prev) =>
                      prev.map((item) =>
                        item.id === employee.id
                          ? {
                              ...item,
                              name: { ...item.name, ar: event.target.value },
                            }
                          : item
                      )
                    );
                  }}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-xs"
                  placeholder="نام عربی"
                />
                <input
                  value={employee.department.fa ?? ""}
                  onChange={(event) => {
                    setEmployees((prev) =>
                      prev.map((item) =>
                        item.id === employee.id
                          ? {
                              ...item,
                              department: {
                                ...item.department,
                                fa: event.target.value,
                              },
                            }
                          : item
                      )
                    );
                  }}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-xs"
                  placeholder="دپارتمان فارسی"
                />
                <input
                  value={employee.department.en ?? ""}
                  onChange={(event) => {
                    setEmployees((prev) =>
                      prev.map((item) =>
                        item.id === employee.id
                          ? {
                              ...item,
                              department: {
                                ...item.department,
                                en: event.target.value,
                              },
                            }
                          : item
                      )
                    );
                  }}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-xs"
                  placeholder="دپارتمان انگلیسی"
                />
                <input
                  value={employee.department.ar ?? ""}
                  onChange={(event) => {
                    setEmployees((prev) =>
                      prev.map((item) =>
                        item.id === employee.id
                          ? {
                              ...item,
                              department: {
                                ...item.department,
                                ar: event.target.value,
                              },
                            }
                          : item
                      )
                    );
                  }}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-xs"
                  placeholder="دپارتمان عربی"
                />
                <select
                  value={employee.supervisorId ?? ""}
                  onChange={(event) => {
                    setEmployees((prev) =>
                      prev.map((item) =>
                        item.id === employee.id
                          ? {
                              ...item,
                              supervisorId: event.target.value || undefined,
                            }
                          : item
                      )
                    );
                  }}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-xs"
                >
                  <option value="">بدون سوپروایزر</option>
                  {supervisors.map((supervisor) => (
                    <option key={supervisor.id} value={supervisor.id}>
                      {supervisor.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => updateEmployee(employee)}
                className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
              >
                ذخیره تغییرات
              </button>
            </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
