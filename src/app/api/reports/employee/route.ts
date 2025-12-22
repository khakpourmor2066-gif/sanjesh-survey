import { NextResponse } from "next/server";
import { readDb } from "@/lib/storage";

type DailyPoint = {
  date: string;
  averageScore: number;
  count: number;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const employeeId = searchParams.get("employeeId");
  if (!employeeId) {
    return NextResponse.json({ error: "missing_employee" }, { status: 400 });
  }

  const db = readDb();
  const employee = db.employees.find((item) => item.id === employeeId);
  if (!employee) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const responses = db.responses.filter(
    (response) =>
      response.employeeId === employeeId && response.status === "completed"
  );
  responses.sort((a, b) => {
    const aDate = new Date(a.completedAt ?? a.lastActivityAt).getTime();
    const bDate = new Date(b.completedAt ?? b.lastActivityAt).getTime();
    return bDate - aDate;
  });

  const allScores: number[] = [];
  const dailyMap = new Map<string, { total: number; count: number }>();
  const feedback: { text: string; date: string }[] = [];

  responses.forEach((response) => {
    const dateValue = response.completedAt ?? response.lastActivityAt;
    const dateKey = dateValue?.slice(0, 10) ?? "unknown";
    const scores = response.answers
      .map((answer) => answer.score)
      .filter((score): score is number => typeof score === "number");
    if (scores.length) {
      const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      allScores.push(average);
      const daily = dailyMap.get(dateKey) ?? { total: 0, count: 0 };
      daily.total += average;
      daily.count += 1;
      dailyMap.set(dateKey, daily);
    }

    response.answers.forEach((answer) => {
      if (answer.comment?.trim()) {
        feedback.push({ text: answer.comment.trim(), date: dateKey });
      }
      if (answer.textValue?.trim()) {
        feedback.push({ text: answer.textValue.trim(), date: dateKey });
      }
    });

    if (response.finalComment?.trim()) {
      feedback.push({ text: response.finalComment.trim(), date: dateKey });
    }
  });

  const daily: DailyPoint[] = Array.from(dailyMap.entries())
    .map(([date, values]) => ({
      date,
      averageScore: values.count ? values.total / values.count : 0,
      count: values.count,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const averageScore =
    allScores.length > 0
      ? allScores.reduce((sum, score) => sum + score, 0) / allScores.length
      : 0;

  feedback.sort((a, b) => b.date.localeCompare(a.date));

  return NextResponse.json({
    employee,
    averageScore,
    responseCount: responses.length,
    daily,
    feedback: feedback.slice(0, 6),
    lastResponseAt:
      responses[0]?.completedAt ?? responses[0]?.lastActivityAt ?? null,
  });
}
