import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const employeeId = searchParams.get("employeeId") ?? "EMP-001";
  const lang = searchParams.get("lang") ?? "fa";

  const payload = {
    customerId: `CUST-${crypto.randomUUID().slice(0, 8)}`,
    groupId: "G-DEFAULT",
    employeeId,
    issuedAt: new Date().toISOString(),
    secret: process.env.AUTH_SHARED_SECRET ?? "shared-mvp-secret",
    lang,
  };

  const token = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return NextResponse.json({ token });
}
