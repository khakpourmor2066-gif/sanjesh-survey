import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readDb, writeDb } from "@/lib/storage";

type ProgressPayload = {
  index?: number;
};

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("survey_session")?.value;
  if (!sessionId) {
    return NextResponse.json({ error: "no_session" }, { status: 401 });
  }

  const payload = (await request.json()) as ProgressPayload;
  if (payload.index === undefined || payload.index < 0) {
    return NextResponse.json({ error: "invalid_index" }, { status: 400 });
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

  response.lastQuestionIndex = payload.index;
  response.lastActivityAt = new Date().toISOString();
  writeDb(db);

  return NextResponse.json({ ok: true });
}
