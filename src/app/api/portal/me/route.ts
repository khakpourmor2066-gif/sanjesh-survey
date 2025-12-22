import { NextResponse } from "next/server";
import { readDb } from "@/lib/storage";
import { getPortalSession } from "@/lib/portal";

export async function GET() {
  const session = await getPortalSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const db = readDb();
  const user = db.users.find((item) => item.id === session.userId);
  if (!user) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({
    role: session.role,
    userId: session.userId,
    employeeId: session.employeeId,
    user,
  });
}
