import { NextResponse } from "next/server";
import crypto from "crypto";
import { readDb, writeDb } from "@/lib/storage";
import { isAdminRequest, isSameOrigin } from "@/lib/admin";
import type { User, UserRole } from "@/lib/types";

type UserPayload = {
  id?: string;
  name?: string;
  role?: UserRole;
  employeeId?: string;
};

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const db = readDb();
  return NextResponse.json({ users: db.users });
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "bad_origin" }, { status: 403 });
  }
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = (await request.json()) as UserPayload;
  if (!body.name || !body.role) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const db = readDb();
  const user: User = {
    id: body.id ?? `USER-${crypto.randomUUID().slice(0, 6).toUpperCase()}`,
    name: body.name,
    role: body.role,
    employeeId: body.employeeId,
  };
  db.users.push(user);
  writeDb(db);
  return NextResponse.json({ user });
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
    updates?: UserPayload;
  };
  if (!body.id || !body.updates) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const db = readDb();
  const user = db.users.find((item) => item.id === body.id);
  if (!user) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (body.updates.name) user.name = body.updates.name;
  if (body.updates.role) user.role = body.updates.role;
  if (body.updates.employeeId !== undefined) {
    user.employeeId = body.updates.employeeId || undefined;
  }

  writeDb(db);
  return NextResponse.json({ user });
}
