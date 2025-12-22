import { NextResponse } from "next/server";
import { readDb } from "@/lib/storage";
import { getPortalCookieOptions } from "@/lib/portal";
import { isSameOrigin } from "@/lib/admin";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "bad_origin" }, { status: 403 });
  }
  const body = (await request.json()) as { userId?: string };
  if (!body.userId) {
    return NextResponse.json({ error: "missing_user" }, { status: 400 });
  }

  const db = readDb();
  const user = db.users.find((item) => item.id === body.userId);
  if (!user || user.role === "admin") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (user.role === "employee" && !user.employeeId) {
    return NextResponse.json({ error: "missing_employee" }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true, user });
  response.cookies.set("portal_role", user.role, getPortalCookieOptions(60 * 60 * 8));
  response.cookies.set("portal_user", user.id, getPortalCookieOptions(60 * 60 * 8));
  response.cookies.set(
    "portal_employee",
    user.employeeId ?? "",
    getPortalCookieOptions(60 * 60 * 8)
  );
  return response;
}
