import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readDb, writeDb } from "@/lib/storage";
import { readSurveyResponseCookie, writeSurveyResponseCookie } from "@/lib/survey-cookie";

type AnswerPayload = {
  questionId?: string;
  score?: number | null;
  textValue?: string;
  yesNoValue?: boolean;
  comment?: string;
  allowEdit?: boolean;
};

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("survey_session")?.value;
  const responseCookie = readSurveyResponseCookie(
    cookieStore.get("survey_response")?.value
  );
  if (!sessionId) {
    return NextResponse.json({ error: "no_session" }, { status: 401 });
  }

  const payload = (await request.json()) as AnswerPayload;
  if (!payload.questionId) {
    return NextResponse.json({ error: "missing_question" }, { status: 400 });
  }

  if (
    payload.score !== null &&
    payload.score !== undefined &&
    (payload.score < 1 || payload.score > 10)
  ) {
    return NextResponse.json({ error: "invalid_score" }, { status: 400 });
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

  if (response.status === "completed" && !payload.allowEdit) {
    return NextResponse.json({ error: "readonly" }, { status: 403 });
  }

  const existing = response.answers.find(
    (item) => item.questionId === payload.questionId
  );
  if (existing) {
    if (payload.score !== undefined) {
      existing.score = payload.score;
    }
    if (payload.textValue !== undefined) {
      existing.textValue = payload.textValue;
    }
    if (payload.yesNoValue !== undefined) {
      existing.yesNoValue = payload.yesNoValue;
    }
    if (payload.comment !== undefined) {
      existing.comment = payload.comment;
    }
  } else {
    response.answers.push({
      questionId: payload.questionId,
      score: payload.score ?? null,
      textValue: payload.textValue,
      yesNoValue: payload.yesNoValue,
      comment: payload.comment,
    });
  }

  response.lastActivityAt = new Date().toISOString();
  response.status = response.status === "completed" ? "completed" : "in_progress";
  writeDb(db);

  const responseObj = NextResponse.json({ ok: true });
  return writeSurveyResponseCookie(responseObj, response);
}
