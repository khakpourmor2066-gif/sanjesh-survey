import { cookies } from "next/headers";

const isSecureEnv =
  process.env.NODE_ENV === "production" ||
  process.env.VERCEL === "1" ||
  process.env.VERCEL === "true";

export type PortalRole = "supervisor" | "employee";

export type PortalSession = {
  role: PortalRole;
  userId: string;
  employeeId?: string;
};

export function getPortalCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "strict" as const,
    path: "/",
    maxAge,
    secure: isSecureEnv,
  };
}

export async function getPortalSession(): Promise<PortalSession | null> {
  const cookieStore = await cookies();
  const role = cookieStore.get("portal_role")?.value as PortalRole | undefined;
  const userId = cookieStore.get("portal_user")?.value;
  const employeeId = cookieStore.get("portal_employee")?.value;
  if (!role || !userId) {
    return null;
  }
  return {
    role,
    userId,
    employeeId: employeeId || undefined,
  };
}
