import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readDb, writeDb } from "@/lib/storage";
import { readSurveyResponseCookie, writeSurveyResponseCookie } from "@/lib/survey-cookie";

export async function POST() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("survey_session")?.value;
  const responseCookie = readSurveyResponseCookie(
    cookieStore.get("survey_response")?.value
  );
  if (!sessionId) {
    return NextResponse.json({ error: "no_session" }, { status: 401 });
  }

  const db = readDb();
  let session = db.sessions.find((item) => item.id === sessionId);
  if (!session && responseCookie) {
    const existingResponse = db.responses.find(
      (item) => item.id === responseCookie.id
    );
    if (!existingResponse) {
      db.responses.push(responseCookie);
    }
    session = {
      id: sessionId,
      customerId: responseCookie.customerId,
      employeeId: responseCookie.employeeId,
      groupId: responseCookie.groupId,
      responseId: responseCookie.id,
      createdAt: new Date().toISOString(),
      lang: responseCookie.lang,
    };
    db.sessions.push(session);
  }
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

  const responseObj = NextResponse.json({ ok: true });
  return writeSurveyResponseCookie(responseObj, response);
}
