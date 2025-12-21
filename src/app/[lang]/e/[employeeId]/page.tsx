import Link from "next/link";
import { getDictionary, type Lang } from "@/lib/i18n";

export default async function EmployeeEntry({
  params,
}: {
  params: Promise<{ lang: Lang; employeeId: string }>;
}) {
  const { lang, employeeId } = await params;
  const t = getDictionary(lang);

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-12 text-[var(--ink)]">
      <div className="mx-auto flex max-w-lg flex-col items-center justify-center">
        <div className="surface w-full rounded-[28px] p-8 sm:p-12">
          <div className="flex flex-col gap-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--accent)]">
              {t.employeeLabel}
            </p>
            <h1 className="text-3xl font-semibold">
              {employeeId.toUpperCase()}
            </h1>
            <p className="text-sm text-[var(--muted)]">{t.loginHint}</p>
          </div>
          <div className="mt-8 flex flex-col gap-3">
            <Link
              href={`/${lang}/auth?employeeId=${encodeURIComponent(
                employeeId
              )}`}
              className="rounded-full bg-[var(--accent-strong)] px-8 py-3 text-center text-sm font-semibold text-white shadow hover:brightness-110"
            >
              {t.login}
            </Link>
            <Link
              href={`/${lang}`}
              className="rounded-full border border-slate-200 px-8 py-3 text-center text-sm font-semibold text-slate-700 hover:border-slate-900"
            >
              {t.startSurvey}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
