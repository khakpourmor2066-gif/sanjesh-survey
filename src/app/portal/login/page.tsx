"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  name: string;
  role: "supervisor" | "employee";
  employeeId?: string;
};

export default function PortalLogin() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [role, setRole] = useState<User["role"]>("supervisor");
  const [selectedUser, setSelectedUser] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/portal/users");
      if (res.ok) {
        const data = (await res.json()) as { users: User[] };
        setUsers(data.users);
      }
      setLoading(false);
    };
    load().catch(() => null);
  }, []);

  const filtered = users.filter((user) => user.role === role);

  const handleLogin = async () => {
    setMessage("");
    if (!selectedUser) {
      setMessage("ابتدا یک کاربر را انتخاب کنید.");
      return;
    }
    const res = await fetch("/api/portal/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: selectedUser }),
    });
    if (!res.ok) {
      setMessage("خطا در ورود. دوباره تلاش کنید.");
      return;
    }
    if (role === "supervisor") {
      router.replace("/portal/supervisor");
    } else {
      router.replace("/portal/employee");
    }
  };

  return (
    <main className="orbit min-h-screen px-6 py-12 text-[var(--ink)]">
      <div className="mx-auto w-full max-w-lg rounded-[28px] bg-white p-8 shadow">
        <h1 className="text-2xl font-semibold">ورود پنل پرسنل</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          انتخاب نقش و حساب کاربری برای مشاهده داشبورد.
        </p>

        <div className="mt-6 grid gap-3">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setRole("supervisor");
                setSelectedUser("");
              }}
              className={`flex-1 rounded-full border px-4 py-2 text-sm font-semibold ${
                role === "supervisor"
                  ? "border-transparent bg-[var(--accent-strong)] text-white"
                  : "border-slate-200 text-slate-700"
              }`}
            >
              سوپروایزر
            </button>
            <button
              type="button"
              onClick={() => {
                setRole("employee");
                setSelectedUser("");
              }}
              className={`flex-1 rounded-full border px-4 py-2 text-sm font-semibold ${
                role === "employee"
                  ? "border-transparent bg-[var(--accent-strong)] text-white"
                  : "border-slate-200 text-slate-700"
              }`}
            >
              کارمند
            </button>
          </div>

          {loading ? (
            <p className="text-sm text-[var(--muted)]">در حال بارگذاری...</p>
          ) : (
            <select
              value={selectedUser}
              onChange={(event) => setSelectedUser(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
            >
              <option value="">انتخاب کاربر</option>
              {filtered.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.id})
                </option>
              ))}
            </select>
          )}

          {message ? (
            <p className="text-sm font-medium text-rose-600">{message}</p>
          ) : null}

          <button
            type="button"
            onClick={handleLogin}
            className="rounded-full bg-[var(--accent-strong)] px-6 py-3 text-sm font-semibold text-white shadow hover:brightness-110"
          >
            ورود
          </button>
        </div>
      </div>
    </main>
  );
}
