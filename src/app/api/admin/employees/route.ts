import { NextResponse } from "next/server";
import crypto from "crypto";
import { readDb, writeDb } from "@/lib/storage";
import { isAdminRequest } from "@/lib/admin";
import type { Employee } from "@/lib/types";

type EmployeePayload = {
  id?: string;
  name?: Record<string, string>;
  department?: Record<string, string>;
  active?: boolean;
  supervisorId?: string;
};

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const db = readDb();
  return NextResponse.json({ employees: db.employees });
}

export async function POST(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = (await request.json()) as EmployeePayload;
  if (!body.name || !body.department) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const db = readDb();
  const employee: Employee = {
    id: body.id ?? `EMP-${crypto.randomUUID().slice(0, 6).toUpperCase()}`,
    name: body.name,
    department: body.department,
    active: body.active ?? true,
    supervisorId: body.supervisorId,
  };
  db.employees.push(employee);
  writeDb(db);

  return NextResponse.json({ employee });
}

export async function PATCH(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = (await request.json()) as {
    id?: string;
    updates?: EmployeePayload;
  };
  if (!body.id || !body.updates) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const db = readDb();
  const employee = db.employees.find((item) => item.id === body.id);
  if (!employee) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (body.updates.name) {
    employee.name = body.updates.name;
  }
  if (body.updates.department) {
    employee.department = body.updates.department;
  }
  if (body.updates.active !== undefined) {
    employee.active = body.updates.active;
  }
  if (body.updates.supervisorId !== undefined) {
    employee.supervisorId = body.updates.supervisorId || undefined;
  }

  writeDb(db);
  return NextResponse.json({ employee });
}
