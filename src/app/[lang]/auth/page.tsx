"use client";

import { use, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getDictionary, type Lang } from "@/lib/i18n";

export default function AuthPage({
  params,
}: {
  params: Promise<{ lang: Lang }>;
}) {
  const { lang } = use(params);
  const t = getDictionary(lang);
  const router = useRouter();
  const searchParams = useSearchParams();
  const employeeId = searchParams.get("employeeId");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const canSubmit = Boolean(employeeId);

  const handleLogin = async () => {
    if (!employeeId) {
      setError(t.invalidEmployee);
      return;
    }
    setLoading(true);
    setError("");

    try {
      const requestResponse = await fetch("/api/oauth/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId,
          lang,
        }),
      });
      if (!requestResponse.ok) {
        throw new Error("oauth_request_failed");
      }
      const requestData = (await requestResponse.json()) as {
        payload: {
          groupId: string;
          customerId: string;
          employeeId: string;
          issuedAt: string;
          signature: string;
          lang?: string;
        };
      };

      const verifyResponse = await fetch("/api/oauth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: requestData.payload }),
      });

      if (!verifyResponse.ok) {
        throw new Error("oauth_verify_failed");
      }

      router.push(`/${lang}/survey`);
    } catch {
      setError(t.problem);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-12 text-[var(--ink)]">
      <div className="mx-auto flex max-w-lg flex-col items-center justify-center">
        <div className="surface w-full rounded-[28px] p-8 sm:p-12">
          <div className="flex flex-col gap-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--accent)]">
              {t.authTitle}
            </p>
            <h1 className="text-3xl font-semibold">{t.login}</h1>
            <p className="text-sm text-[var(--muted)]">{t.authSubtitle}</p>
          </div>
          <div className="mt-8 flex flex-col gap-3">
            <button
              type="button"
              onClick={handleLogin}
              className="rounded-full bg-[var(--accent-strong)] px-8 py-3 text-center text-sm font-semibold text-white shadow hover:brightness-110 disabled:opacity-70"
              disabled={loading || !canSubmit}
            >
              {loading ? t.redirecting : t.login}
            </button>
            {loading ? (
              <p className="text-xs text-[var(--muted)]">
                {t.redirecting}
              </p>
            ) : null}
            {error ? (
              <p className="text-sm font-medium text-rose-600">{error}</p>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
