import { notFound } from "next/navigation";

const supportedLangs = ["fa", "en", "ar"] as const;

type Lang = (typeof supportedLangs)[number];

function isSupportedLang(lang: string): lang is Lang {
  return supportedLangs.includes(lang as Lang);
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isSupportedLang(lang)) {
    notFound();
  }

  const isRtl = lang === "fa" || lang === "ar";

  return (
    <div
      className={`min-h-screen ${isRtl ? "rtl" : "ltr"}`}
      lang={lang}
    >
      {children}
    </div>
  );
}
