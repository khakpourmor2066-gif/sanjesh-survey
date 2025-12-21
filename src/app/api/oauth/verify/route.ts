import { NextResponse } from "next/server";
import crypto from "crypto";
import { readDb, writeDb } from "@/lib/storage";
import type { SurveyResponse, SurveySession } from "@/lib/types";
import { verifyAuthPayload, type AuthPayload } from "@/lib/auth";

const TOKEN_TTL_MS = 5 * 60 * 1000;
const DAILY_LIMIT_MS = 24 * 60 * 60 * 1000;

function isRecent(dateIso: string, windowMs: number) {
  const issued = new Date(dateIso).getTime();
  return Date.now() - issued <= windowMs;
}

export async function POST(request: Request) {
  const body = (await request.json()) as { payload?: AuthPayload };
  const payload = body.payload;
  if (!payload) {
    return NextResponse.json(
      { error: "missing_payload" },
      { status: 400 }
    );
  }

  const secret = process.env.AUTH_SHARED_SECRET ?? "shared-mvp-secret";
  if (!verifyAuthPayload(payload, secret)) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  if (!isRecent(payload.issuedAt, TOKEN_TTL_MS)) {
    return NextResponse.json({ error: "token_expired" }, { status: 401 });
  }

  const db = readDb();
  const nowIso = new Date().toISOString();
  const nowMs = Date.now();

  const recentResponses = db.responses.filter((response) => {
    if (
      response.customerId !== payload.customerId ||
      response.employeeId !== payload.employeeId
    ) {
      return false;
    }
    const startMs = new Date(response.startedAt).getTime();
    return nowMs - startMs <= DAILY_LIMIT_MS;
  });

  const completedToday = recentResponses.find(
    (response) => response.status === "completed"
  );
  if (completedToday) {
    return NextResponse.json(
      { error: "daily_limit_reached" },
      { status: 429 }
    );
  }

  let response = recentResponses.find(
    (item) => item.status !== "completed"
  );

  if (!response) {
    response = {
      id: crypto.randomUUID(),
      customerId: payload.customerId,
      employeeId: payload.employeeId,
      groupId: payload.groupId,
      status: "in_progress",
      startedAt: nowIso,
      lastActivityAt: nowIso,
      lastQuestionIndex: 0,
      lang: payload.lang ?? "fa",
      editToken: crypto.randomUUID(),
      answers: [],
    } satisfies SurveyResponse;
    db.responses.push(response);
  }

  const session: SurveySession = {
    id: crypto.randomUUID(),
    customerId: payload.customerId,
    employeeId: payload.employeeId,
    groupId: payload.groupId,
    responseId: response.id,
    createdAt: nowIso,
    lang: payload.lang ?? "fa",
  };
  db.sessions.push(session);
  writeDb(db);

  const responseObj = NextResponse.json({
    sessionId: session.id,
    responseId: response.id,
  });

  responseObj.cookies.set("survey_session", session.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  return responseObj;
}
