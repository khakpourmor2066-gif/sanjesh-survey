import { cookies } from "next/headers";

const isSecureEnv =
  process.env.NODE_ENV === "production" ||
  process.env.VERCEL === "1" ||
  process.env.VERCEL === "true";

export async function isAdminRequest() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_session")?.value === "1";
}

export function getAdminCredentials() {
  return {
    username: process.env.ADMIN_USERNAME ?? "admin",
    password: process.env.ADMIN_PASSWORD ?? "admin123",
  };
}

export function getAdminCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "strict" as const,
    path: "/",
    maxAge,
    secure: isSecureEnv,
  };
}

export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) {
    return true;
  }
  const host = request.headers.get("host");
  if (!host) {
    return false;
  }
  return origin === `https://${host}` || origin === `http://${host}`;
}
