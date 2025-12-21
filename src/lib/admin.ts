import { cookies } from "next/headers";

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
