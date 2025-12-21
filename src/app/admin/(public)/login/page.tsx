"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) {
      setError("نام کاربری یا رمز عبور اشتباه است.");
      setLoading(false);
      return;
    }
    router.replace("/admin");
  };

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto w-full max-w-md rounded-3xl bg-white p-8 shadow">
        <h1 className="text-2xl font-semibold">ورود مدیر</h1>
        <p className="mt-2 text-sm text-slate-500">
          برای مدیریت سیستم وارد شوید.
        </p>
        <div className="mt-6 grid gap-3">
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="نام کاربری"
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
          />
          <input
            value={password}
            type="password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="رمز عبور"
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
          />
          {error ? (
            <p className="text-sm font-medium text-rose-600">{error}</p>
          ) : null}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-70"
          >
            {loading ? "در حال ورود..." : "ورود"}
          </button>
        </div>
      </div>
    </main>
  );
}
