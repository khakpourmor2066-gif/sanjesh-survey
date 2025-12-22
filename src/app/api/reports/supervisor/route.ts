import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin";
import { getPortalSession } from "@/lib/portal";
import { readDb } from "@/lib/storage";
import { getCachedReport, setCachedReport } from "@/lib/report-cache";

type DailyBucket = {
  date: string;
  total: number;
  count: number;
};

function parseRange(searchParams: URLSearchParams) {
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const startDate = start ? new Date(`${start}T00:00:00.000Z`) : null;
  const endDate = end ? new Date(`${end}T23:59:59.999Z`) : null;
  return { startDate, endDate };
}

function isInRange(dateValue: string | undefined, start: Date | null, end: Date | null) {
  if (!dateValue) return false;
  const time = new Date(dateValue).getTime();
  if (Number.isNaN(time)) return false;
  if (start && time < start.getTime()) return false;
  if (end && time > end.getTime()) return false;
  return true;
}

function getPreviousRange(start: Date, end: Date) {
  const rangeMs = end.getTime() - start.getTime();
  if (rangeMs < 0) return null;
  const prevEnd = new Date(start.getTime() - 1);
  const prevStart = new Date(start.getTime() - rangeMs - 1);
  return { prevStart, prevEnd };
}

export async function GET(request: Request) {
  const isAdmin = await isAdminRequest();
  const portal = await getPortalSession();

  const { searchParams } = new URL(request.url);
  const supervisorId =
    searchParams.get("supervisorId") ??
    (portal?.role === "supervisor" ? portal.userId : null);
  if (!supervisorId) {
    return NextResponse.json({ error: "missing_supervisor" }, { status: 400 });
  }
  if (!isAdmin && portal?.role !== "supervisor") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { startDate, endDate } = parseRange(searchParams);
  const cacheKey = `supervisor:${supervisorId}:${searchParams.get("start") ?? ""}:${searchParams.get("end") ?? ""}`;
  const cached = getCachedReport<unknown>(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  const db = readDb();
  const questionMap = new Map(db.questions.map((q) => [q.id, q]));

  const teamEmployees = db.employees.filter(
    (employee) => employee.supervisorId === supervisorId && employee.active
  );
  const teamIds = new Set(teamEmployees.map((employee) => employee.id));

  const employees = new Map<
    string,
    {
      employeeId: string;
      name?: Record<string, string>;
      department?: Record<string, string>;
      totalScore: number;
      scoreCount: number;
      responseCount: number;
      lastResponseAt?: string;
    }
  >();

  const daily = new Map<string, DailyBucket>();

  const filteredResponses = db.responses
    .filter((response) => response.status === "completed")
    .filter((response) => teamIds.has(response.employeeId))
    .filter((response) =>
      isInRange(response.completedAt ?? response.lastActivityAt, startDate, endDate)
    );

  let totalScore = 0;
  let scoreCount = 0;

  filteredResponses.forEach((response) => {
      const employeeRecord = db.employees.find(
        (item) => item.id === response.employeeId
      );

      if (!employees.has(response.employeeId)) {
        employees.set(response.employeeId, {
          employeeId: response.employeeId,
          name: employeeRecord?.name,
          department: employeeRecord?.department,
          totalScore: 0,
          scoreCount: 0,
          responseCount: 0,
          lastResponseAt: response.completedAt ?? response.lastActivityAt,
        });
      }

      const employee = employees.get(response.employeeId)!;
      employee.responseCount += 1;
      const responseDate = (response.completedAt ?? response.lastActivityAt)?.slice(0, 10);
      if (responseDate) {
        if (!daily.has(responseDate)) {
          daily.set(responseDate, { date: responseDate, total: 0, count: 0 });
        }
      }

      response.answers.forEach((answer) => {
        if (answer.score === undefined || answer.score === null) {
          return;
        }
        totalScore += answer.score;
        scoreCount += 1;
        employee.totalScore += answer.score;
        employee.scoreCount += 1;

        if (responseDate) {
          const bucket = daily.get(responseDate)!;
          bucket.total += answer.score;
          bucket.count += 1;
        }
      });

      if (
        employee.lastResponseAt &&
        response.completedAt &&
        response.completedAt > employee.lastResponseAt
      ) {
        employee.lastResponseAt = response.completedAt;
      }
    });

  const employeeRows = Array.from(employees.values()).map((employee) => ({
    employeeId: employee.employeeId,
    name: employee.name,
    department: employee.department,
    averageScore:
      employee.scoreCount > 0 ? employee.totalScore / employee.scoreCount : 0,
    responseCount: employee.responseCount,
    lastResponseAt: employee.lastResponseAt ?? null,
  }));

  const questionRows = teamEmployees.map((employee) => ({
    employeeId: employee.id,
    name: employee.name,
    department: employee.department,
  }));

  const dailyRows = Array.from(daily.values()).map((bucket) => ({
    date: bucket.date,
    averageScore: bucket.count > 0 ? bucket.total / bucket.count : 0,
    count: bucket.count,
  }));

  const comparison =
    startDate && endDate
      ? (() => {
          const prevRange = getPreviousRange(startDate, endDate);
          if (!prevRange) return null;
          let prevTotal = 0;
          let prevCount = 0;
          let prevResponses = 0;
          db.responses
            .filter((response) => response.status === "completed")
            .filter((response) => teamIds.has(response.employeeId))
            .filter((response) =>
              isInRange(
                response.completedAt ?? response.lastActivityAt,
                prevRange.prevStart,
                prevRange.prevEnd
              )
            )
            .forEach((response) => {
              prevResponses += 1;
              response.answers.forEach((answer) => {
                if (answer.score === undefined || answer.score === null) return;
                prevTotal += answer.score;
                prevCount += 1;
              });
            });
          const prevAverage = prevCount ? prevTotal / prevCount : 0;
          const currentAverage = scoreCount ? totalScore / scoreCount : 0;
          return {
            previousAverage: prevAverage,
            previousResponses: prevResponses,
            averageDelta: currentAverage - prevAverage,
            responseDelta: filteredResponses.length - prevResponses,
          };
        })()
      : null;

  const payload = {
    employees: employeeRows,
    team: questionRows,
    daily: dailyRows,
    questions: Array.from(questionMap.values()),
    comparison,
    summary: {
      averageScore: scoreCount ? totalScore / scoreCount : 0,
      responseCount: filteredResponses.length,
    },
  };
  setCachedReport(cacheKey, payload);
  return NextResponse.json(payload);
}
