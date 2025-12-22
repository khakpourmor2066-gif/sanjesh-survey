import { NextResponse } from "next/server";
import crypto from "crypto";
import { readDb, writeDb } from "@/lib/storage";
import { isAdminRequest, isSameOrigin } from "@/lib/admin";
import type { SurveyQuestion, QuestionType, QuestionCategory } from "@/lib/types";

type QuestionPayload = {
  id?: string;
  text?: Record<string, string>;
  type?: QuestionType;
  category?: QuestionCategory;
  required?: boolean;
  order?: number;
  active?: boolean;
};

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const db = readDb();
  return NextResponse.json({ questions: db.questions });
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "bad_origin" }, { status: 403 });
  }
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = (await request.json()) as QuestionPayload;
  if (!body.text || !body.type || !body.category) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  const db = readDb();
  const nextOrder =
    body.order ?? (db.questions.length ? Math.max(...db.questions.map((q) => q.order)) + 1 : 1);
  const question: SurveyQuestion = {
    id: body.id ?? `Q-${crypto.randomUUID().slice(0, 6).toUpperCase()}`,
    text: body.text,
    type: body.type,
    category: body.category,
    required: body.required ?? true,
    order: nextOrder,
    active: body.active ?? true,
  };
  db.questions.push(question);
  writeDb(db);
  return NextResponse.json({ question });
}

export async function PATCH(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "bad_origin" }, { status: 403 });
  }
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = (await request.json()) as {
    id?: string;
    updates?: QuestionPayload;
  };
  if (!body.id || !body.updates) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  const db = readDb();
  const question = db.questions.find((item) => item.id === body.id);
  if (!question) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (body.updates.text) question.text = body.updates.text;
  if (body.updates.type) question.type = body.updates.type;
  if (body.updates.category) question.category = body.updates.category;
  if (body.updates.required !== undefined) question.required = body.updates.required;
  if (body.updates.order !== undefined) question.order = body.updates.order;
  if (body.updates.active !== undefined) question.active = body.updates.active;

  writeDb(db);
  return NextResponse.json({ question });
}
