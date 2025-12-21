import crypto from "crypto";

export type AuthPayload = {
  groupId: string;
  customerId: string;
  employeeId: string;
  issuedAt: string;
  signature: string;
  lang?: string;
};

export function signAuthPayload(
  groupId: string,
  customerId: string,
  issuedAt: string,
  secret: string
) {
  return crypto
    .createHmac("sha256", secret)
    .update(`${groupId}.${customerId}.${issuedAt}`)
    .digest("hex");
}

export function verifyAuthPayload(payload: AuthPayload, secret: string) {
  const expected = signAuthPayload(
    payload.groupId,
    payload.customerId,
    payload.issuedAt,
    secret
  );
  if (expected.length !== payload.signature.length) {
    return false;
  }
  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(payload.signature)
  );
}
