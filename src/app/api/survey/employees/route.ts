import { NextResponse } from "next/server";
import { readDb } from "@/lib/storage";

export async function GET() {
  const db = readDb();
  const employees = db.employees.filter((employee) => employee.active);
  return NextResponse.json({ employees });
}
