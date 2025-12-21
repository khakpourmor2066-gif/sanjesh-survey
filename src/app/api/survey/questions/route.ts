import { NextResponse } from "next/server";
import { readDb } from "@/lib/storage";

export async function GET() {
  const db = readDb();
  const active = db.questions
    .filter((question) => question.active)
    .sort((a, b) => a.order - b.order);
  return NextResponse.json({ questions: active });
}
