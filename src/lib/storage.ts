import fs from "fs";
import path from "path";
import type { SurveyDb, Employee, SurveyQuestion, User } from "./types";
import { defaultQuestions } from "./questions";
import { employees as defaultEmployees } from "./employees";

const dataDir = path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "db.json");

const emptyDb: SurveyDb = {
  sessions: [],
  responses: [],
  employees: [],
  questions: [],
  users: [],
};

function seedEmployees(existing: Employee[] | undefined) {
  if (existing && existing.length > 0) return existing;
  return defaultEmployees.map((employee) => ({
    id: employee.id,
    name: employee.name,
    department: employee.department,
    active: employee.active ?? true,
    supervisorId: employee.supervisorId,
  }));
}

function seedQuestions(existing: SurveyQuestion[] | undefined) {
  if (existing && existing.length > 0) return existing;
  return defaultQuestions.map((question) => ({
    ...question,
  }));
}

function seedUsers(existing: User[] | undefined) {
  if (existing && existing.length > 0) return existing;
  const defaults: User[] = [
    { id: "ADMIN-001", name: "Admin", role: "admin" },
    { id: "SUP-001", name: "Supervisor 1", role: "supervisor" },
    { id: "SUP-002", name: "Supervisor 2", role: "supervisor" },
  ];
  return defaults;
}

function normalizeDb(db: Partial<SurveyDb>): SurveyDb {
  return {
    sessions: db.sessions ?? [],
    responses: db.responses ?? [],
    employees: seedEmployees(db.employees),
    questions: seedQuestions(db.questions),
    users: seedUsers(db.users),
  };
}

function ensureDbFile() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify(emptyDb, null, 2));
  }
}

export function readDb(): SurveyDb {
  ensureDbFile();
  const raw = fs.readFileSync(dbPath, "utf-8");
  const parsed = JSON.parse(raw) as Partial<SurveyDb>;
  const normalized = normalizeDb(parsed);
  if (!parsed.employees || !parsed.questions || !parsed.users) {
    writeDb(normalized);
  }
  return normalized;
}

export function writeDb(db: SurveyDb) {
  ensureDbFile();
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}
