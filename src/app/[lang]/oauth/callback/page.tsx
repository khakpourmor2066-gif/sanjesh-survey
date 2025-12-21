"use client";

import { use, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getDictionary, type Lang } from "@/lib/i18n";

export default function OAuthCallback({
  params,
}: {
  params: Promise<{ lang: Lang }>;
}) {
  const { lang } = use(params);
  const t = getDictionary(lang);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setError(t.problem);
      return;
    }

    const verify = async () => {
      const response = await fetch("/api/oauth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        setError(t.problem);
        return;
      }

      router.replace(`/${lang}/survey`);
    };

    verify().catch(() => setError(t.problem));
  }, [lang, router, searchParams, t.problem]);

  return (
    <main className="orbit min-h-screen px-6 py-10 text-[var(--ink)]">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
        <div className="surface w-full rounded-[28px] p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[var(--accent)]">
            {t.redirecting}
          </p>
          {error ? (
            <>
              <h1 className="mt-4 text-2xl font-semibold">{t.problem}</h1>
              <button
                type="button"
                onClick={() => router.back()}
                className="mt-6 rounded-full border border-slate-200 px-6 py-2 text-sm font-semibold text-slate-700 hover:border-slate-900"
              >
                {t.retry}
              </button>
            </>
          ) : (
            <div className="mt-6 flex items-center justify-center gap-3 text-sm text-[var(--muted)]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--accent)]" />
              <span>{t.redirecting}</span>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
