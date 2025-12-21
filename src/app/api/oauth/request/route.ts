import crypto from "crypto";
import { signAuthPayload, type AuthPayload } from "@/lib/auth";

type RequestPayload = {
  employeeId?: string;
  lang?: string;
  groupId?: string;
  customerId?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as RequestPayload;
  if (!body.employeeId) {
    return new Response(JSON.stringify({ error: "missing_employee" }), {
      status: 400,
    });
  }

  const secret = process.env.AUTH_SHARED_SECRET ?? "shared-mvp-secret";
  const groupId = body.groupId ?? process.env.AUTH_GROUP_ID ?? "G-DEFAULT";
  const customerId =
    body.customerId ?? `CUST-${crypto.randomUUID().slice(0, 8)}`;
  const issuedAt = new Date().toISOString();

  const authEndpoint = process.env.AUTH_ENDPOINT;
  if (authEndpoint) {
    const response = await fetch(authEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        group_id: groupId,
        customer_id: customerId,
        shared_secret: secret,
        employee_id: body.employeeId,
      }),
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: "auth_failed" }), {
        status: 401,
      });
    }

    const data = (await response.json()) as {
      status?: string;
      group_id: string;
      customer_id: string;
      employee_id?: string;
      issued_at: string;
      signature: string;
    };

    if (data.status && data.status !== "ok") {
      return new Response(JSON.stringify({ error: "auth_rejected" }), {
        status: 401,
      });
    }

    const payload: AuthPayload = {
      groupId: data.group_id,
      customerId: data.customer_id,
      employeeId: data.employee_id ?? body.employeeId,
      issuedAt: data.issued_at,
      signature: data.signature,
      lang: body.lang,
    };

    return new Response(JSON.stringify({ payload }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const signature = signAuthPayload(groupId, customerId, issuedAt, secret);
  const payload: AuthPayload = {
    groupId,
    customerId,
    employeeId: body.employeeId,
    issuedAt,
    signature,
    lang: body.lang,
  };

  return new Response(JSON.stringify({ payload }), {
    headers: { "Content-Type": "application/json" },
  });
}
