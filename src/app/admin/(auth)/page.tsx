import Link from "next/link";

export default function AdminDashboard() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-10">
      <div className="rounded-3xl bg-white p-8 shadow">
        <h1 className="text-3xl font-semibold">پنل مدیریت</h1>
        <p className="mt-2 text-sm text-slate-500">
          مدیریت کارمندان، سوالات، نقش‌ها و QR.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/admin/employees"
            className="rounded-full border border-slate-200 px-6 py-2 text-sm font-semibold text-slate-700"
          >
            کارمندان
          </Link>
          <Link
            href="/admin/questions"
            className="rounded-full border border-slate-200 px-6 py-2 text-sm font-semibold text-slate-700"
          >
            سوالات
          </Link>
          <Link
            href="/admin/roles"
            className="rounded-full border border-slate-200 px-6 py-2 text-sm font-semibold text-slate-700"
          >
            نقش‌ها و سوپروایزر
          </Link>
          <Link
            href="/admin/qr"
            className="rounded-full border border-slate-200 px-6 py-2 text-sm font-semibold text-slate-700"
          >
            مدیریت QR
          </Link>
          <Link
            href="/admin/reports"
            className="rounded-full border border-slate-200 px-6 py-2 text-sm font-semibold text-slate-700"
          >
            گزارش‌ها
          </Link>
        </div>
      </div>
    </main>
  );
}
