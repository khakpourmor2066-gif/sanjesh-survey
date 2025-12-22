import { NextResponse } from "next/server";
import { getAdminCookieOptions, getAdminCredentials, isSameOrigin } from "@/lib/admin";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "bad_origin" }, { status: 403 });
  }
  const body = (await request.json()) as {
    username?: string;
    password?: string;
  };

  const { username, password } = getAdminCredentials();
  if (body.username !== username || body.password !== password) {
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("admin_session", "1", getAdminCookieOptions(60 * 60 * 8));
  return response;
}
