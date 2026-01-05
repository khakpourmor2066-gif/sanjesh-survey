import type { SurveyResponse } from "@/lib/types";

const secureCookie =
  process.env.NODE_ENV === "production" ||
  process.env.VERCEL === "1" ||
  process.env.VERCEL === "true";

const COOKIE_NAME = "survey_response";

export function readSurveyResponseCookie(value: string | undefined): SurveyResponse | null {
  if (!value) return null;
  try {
    const json = Buffer.from(value, "base64url").toString("utf-8");
    return JSON.parse(json) as SurveyResponse;
  } catch {
    return null;
  }
}

export function writeSurveyResponseCookie(response: Response, payload: SurveyResponse) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const headers = new Headers(response.headers);
  const cookie = [
    `${COOKIE_NAME}=${encoded}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=43200",
    secureCookie ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
  headers.append("Set-Cookie", cookie);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export function getSurveyResponseCookieName() {
  return COOKIE_NAME;
}
