import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin";
import { readDb } from "@/lib/storage";

type DailyBucket = {
  date: string;
  total: number;
  count: number;
};

export async function GET(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const supervisorId = searchParams.get("supervisorId");
  if (!supervisorId) {
    return NextResponse.json({ error: "missing_supervisor" }, { status: 400 });
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

  db.responses
    .filter((response) => response.status === "completed")
    .filter((response) => teamIds.has(response.employeeId))
    .forEach((response) => {
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

  return NextResponse.json({
    employees: employeeRows,
    team: questionRows,
    daily: dailyRows,
    questions: Array.from(questionMap.values()),
  });
}
