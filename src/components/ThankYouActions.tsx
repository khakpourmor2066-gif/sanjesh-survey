"use client";

import { useRouter } from "next/navigation";

type Props = {
  lang: string;
  editToken?: string;
  labels: {
    edit: string;
    backHome: string;
    logout: string;
  };
};

export default function ThankYouActions({ lang, editToken, labels }: Props) {
  const router = useRouter();

  const handleHome = () => {
    fetch("/api/survey/thank-you-closed", { method: "POST" }).finally(() => {
      router.replace(`/${lang}`);
    });
  };

  const handleLogout = async () => {
    await fetch("/api/survey/logout", { method: "POST" });
    router.replace(`/${lang}`);
  };

  return (
    <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
      {editToken ? (
        <button
          type="button"
          onClick={() => router.replace(`/${lang}/survey?editToken=${editToken}`)}
          className="inline-flex rounded-full border border-slate-200 px-6 py-2 text-sm font-semibold text-slate-700 hover:border-slate-900"
        >
          {labels.edit}
        </button>
      ) : null}
      <button
        type="button"
        onClick={handleHome}
        className="inline-flex rounded-full border border-slate-200 px-6 py-2 text-sm font-semibold text-slate-700 hover:border-slate-900"
      >
        {labels.backHome}
      </button>
      <button
        type="button"
        onClick={handleLogout}
        className="inline-flex rounded-full bg-[var(--accent-strong)] px-6 py-2 text-sm font-semibold text-white shadow hover:brightness-110"
      >
        {labels.logout}
      </button>
    </div>
  );
}
