import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readDb, writeDb } from "@/lib/storage";

export async function POST() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("survey_session")?.value;
  if (!sessionId) {
    return NextResponse.json({ error: "no_session" }, { status: 401 });
  }

  const db = readDb();
  const session = db.sessions.find((item) => item.id === sessionId);
  if (!session) {
    return NextResponse.json({ error: "no_session" }, { status: 401 });
  }

  const response = db.responses.find(
    (item) => item.id === session.responseId
  );
  if (!response) {
    return NextResponse.json({ error: "missing_response" }, { status: 404 });
  }

  if (response.status === "in_progress") {
    response.status = "incomplete";
    response.lastActivityAt = new Date().toISOString();
    writeDb(db);
  }

  return NextResponse.json({ ok: true });
}
