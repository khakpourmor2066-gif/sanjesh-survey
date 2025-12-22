import { NextResponse } from "next/server";
import { getPortalCookieOptions } from "@/lib/portal";
import { isSameOrigin } from "@/lib/admin";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "bad_origin" }, { status: 403 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("portal_role", "", getPortalCookieOptions(0));
  response.cookies.set("portal_user", "", getPortalCookieOptions(0));
  response.cookies.set("portal_employee", "", getPortalCookieOptions(0));
  return response;
}
