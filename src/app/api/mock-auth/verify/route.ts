import { signAuthPayload } from "@/lib/auth";

type MockAuthRequest = {
  group_id?: string;
  customer_id?: string;
  shared_secret?: string;
  employee_id?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as MockAuthRequest;

  if (!body.group_id || !body.customer_id || !body.shared_secret) {
    return new Response(
      JSON.stringify({ status: "error", message: "missing_fields" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const expectedSecret =
    process.env.MOCK_AUTH_SHARED_SECRET ?? "MOCK_SHARED_SECRET";
  if (body.shared_secret !== expectedSecret) {
    return new Response(
      JSON.stringify({ status: "error", message: "invalid_credentials" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const issuedAt = new Date().toISOString();
  const signature = signAuthPayload(
    body.group_id,
    body.customer_id,
    issuedAt,
    body.shared_secret
  );

  return new Response(
    JSON.stringify({
      status: "ok",
      group_id: body.group_id,
      customer_id: body.customer_id,
      employee_id: body.employee_id ?? "EMP-001",
      issued_at: issuedAt,
      signature,
    }),
    { headers: { "Content-Type": "application/json" } }
  );
}
