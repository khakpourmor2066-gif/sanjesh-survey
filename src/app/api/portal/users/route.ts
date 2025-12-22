import { NextResponse } from "next/server";
import { readDb } from "@/lib/storage";

export async function GET() {
  const db = readDb();
  const users = db.users.filter((user) => user.role !== "admin");
  return NextResponse.json({ users });
}
