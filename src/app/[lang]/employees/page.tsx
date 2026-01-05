import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDictionary, type Lang } from "@/lib/i18n";
import { readDb } from "@/lib/storage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EmployeesPage({
  params,
}: {
  params: Promise<{ lang: Lang }>;
}) {
  const { lang } = await params;
  const cookieStore = await cookies();
  const isAuthed = cookieStore.get("admin_session")?.value === "1";
  if (!isAuthed) {
    redirect("/admin/login");
  }
  const t = getDictionary(lang);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const db = readDb();
  const employees = db.employees.filter((employee) => employee.active);

  return (
    <main className="orbit min-h-screen px-6 py-10 text-[var(--ink)]">
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        <div className="surface rounded-[28px] p-8 sm:p-12">
          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--accent)]">
              {t.employeesTitle}
            </p>
            <h1 className="text-3xl font-semibold">{t.employeesTitle}</h1>
            <p className="text-sm text-[var(--muted)]">{t.employeesSubtitle}</p>
          </div>
          <div className="mt-6">
            <Link
              href={`/${lang}`}
              className="rounded-full border border-slate-200 px-6 py-2 text-sm font-semibold text-slate-700 hover:border-slate-900"
            >
              {t.startSurvey}
            </Link>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {employees.map((employee) => {
            const url = `${baseUrl}/${lang}/e/${employee.id}`;
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
            return (
              <div
                key={employee.id}
                className="surface flex flex-col gap-4 rounded-[24px] p-6 sm:flex-row sm:items-center"
              >
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--accent)]">
                    {employee.id}
                  </p>
                  <h2 className="text-xl font-semibold">{name}</h2>
                  <p className="text-sm text-[var(--muted)]">
                    {department}
                  </p>
                  <Link
                    href={`/${lang}/e/${employee.id}`}
                    className="mt-4 inline-flex rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:border-slate-900"
                  >
                    {t.startSurvey}
                  </Link>
                  <Link
                    href={`/${lang}/employee/${employee.id}`}
                    className="mt-3 inline-flex rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:border-slate-900"
                  >
                    {t.viewDashboard}
                  </Link>
                </div>
                <div className="flex items-center justify-center rounded-2xl bg-white p-4 shadow">
                  <img
                    src={`/api/qr?data=${encodeURIComponent(url)}`}
                    alt={employee.id}
                    width={140}
                    height={140}
                    className="h-[140px] w-[140px]"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
