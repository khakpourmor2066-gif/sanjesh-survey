import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const secureCookie =
  process.env.NODE_ENV === "production" ||
  process.env.VERCEL === "1" ||
  process.env.VERCEL === "true";

export async function POST() {
  const cookieStore = await cookies();

  cookieStore.set("survey_session", "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    secure: secureCookie,
  });

  cookieStore.set("survey_logged_out", "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
    secure: secureCookie,
  });

  cookieStore.set("survey_thank_you_closed", "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
    secure: secureCookie,
  });

  return NextResponse.json({ ok: true });
}
