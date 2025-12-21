import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { readDb, writeDb } from "@/lib/storage";
import type { SurveySession } from "@/lib/types";

export async function GET(request: Request) {
  const db = readDb();
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("survey_session")?.value;
  const { searchParams } = new URL(request.url);
  const editToken = searchParams.get("editToken");
  const loggedOut = cookieStore.get("survey_logged_out")?.value === "1";

  if (loggedOut && editToken) {
    return NextResponse.json({ error: "logged_out" }, { status: 403 });
  }

  let session = sessionId
    ? db.sessions.find((item) => item.id === sessionId)
    : undefined;

  if (!session && editToken) {
    const response = db.responses.find(
      (item) => item.editToken === editToken
    );
    if (!response) {
      return NextResponse.json({ error: "invalid_edit_token" }, { status: 404 });
    }

    session = {
      id: crypto.randomUUID(),
      customerId: response.customerId,
      employeeId: response.employeeId,
      groupId: response.groupId,
      responseId: response.id,
      createdAt: new Date().toISOString(),
      lang: response.lang,
    } satisfies SurveySession;

    db.sessions.push(session);
    writeDb(db);

    const responseObj = NextResponse.json({
      session,
      response,
    });
    responseObj.cookies.set("survey_session", session.id, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
    return responseObj;
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

  const employee = db.employees.find(
    (item) => item.id === response.employeeId
  );

  return NextResponse.json({ session, response, employee });
}
