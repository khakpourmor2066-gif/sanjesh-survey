"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { getDictionary, type Lang } from "@/lib/i18n";

export default function Home({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = use(params);
  const t = getDictionary(lang);
  const router = useRouter();

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
            <p className="mt-2 text-xs text-[var(--muted)]">deploy-check-001</p>
          </div>

          <div className="mt-6 flex flex-col items-center gap-3">
            <p className="text-center text-xs text-[var(--muted)]">
              {t.selectLanguage}
            </p>
            <LanguageSwitcher lang={lang} />
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => router.push(`/${lang}/scan`)}
              className="w-full rounded-full bg-[var(--accent-strong)] px-6 py-3 text-sm font-semibold text-white shadow hover:brightness-110"
            >
              {t.scanQr}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/login")}
              className="w-full rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 hover:border-slate-900"
            >
              {t.adminLogin}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
