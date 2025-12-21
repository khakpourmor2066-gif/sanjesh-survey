"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { languages } from "@/lib/i18n";

type Props = {
  lang: string;
};

export default function LanguageSwitcher({ lang }: Props) {
  const pathname = usePathname();

  const pathWithoutLang = pathname.replace(/^\/(fa|en|ar)(\/|$)/, "/");

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
      {languages.map((item) => (
        <Link
          key={item.id}
          href={`/${item.id}${pathWithoutLang}`}
          className={`rounded-full border px-3 py-1 transition ${
            item.id === lang
              ? "border-transparent bg-slate-900 text-white"
              : "border-slate-200 hover:border-slate-900"
          }`}
        >
          {item.native}
        </Link>
      ))}
    </div>
  );
}
