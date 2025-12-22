import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminCookieOptions, isSameOrigin } from "@/lib/admin";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "bad_origin" }, { status: 403 });
  }
  const cookieStore = await cookies();
  cookieStore.set("admin_session", "", getAdminCookieOptions(0));

  return NextResponse.json({ ok: true });
}
