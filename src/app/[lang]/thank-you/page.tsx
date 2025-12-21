import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDictionary, type Lang } from "@/lib/i18n";
import ThankYouActions from "@/components/ThankYouActions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ThankYou({
  params,
  searchParams,
}: {
  params: Promise<{ lang: Lang }>;
  searchParams: Promise<{ editToken?: string }>;
}) {
  const { lang } = await params;
  const { editToken } = await searchParams;
  const t = getDictionary(lang);
  const cookieStore = await cookies();
  const loggedOut = cookieStore.get("survey_logged_out")?.value === "1";
  const thankYouClosed =
    cookieStore.get("survey_thank_you_closed")?.value === "1";

  if (loggedOut || thankYouClosed) {
    redirect(`/${lang}`);
  }

  return (
    <main className="orbit min-h-screen px-6 py-10 text-[var(--ink)]">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
        <div className="surface w-full rounded-[28px] p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--accent)]">
            {t.brand}
          </p>
          <h1 className="mt-4 text-3xl font-semibold">{t.thankYou}</h1>
          <p className="mt-3 text-sm text-[var(--muted)]">
            {t.thankYouMessage}
          </p>
          <p className="mt-2 text-xs text-[var(--muted)]">
            {t.yourFeedbackMatters}
          </p>
          <ThankYouActions
            lang={lang}
            editToken={editToken}
            labels={{ edit: t.edit, backHome: t.backHome, logout: t.logout }}
          />
        </div>
      </div>
    </main>
  );
}
