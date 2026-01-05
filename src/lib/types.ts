export type SurveyAnswer = {
  questionId: string;
  score?: number | null;
  textValue?: string;
  yesNoValue?: boolean;
  comment?: string;
};

export type SurveyResponseStatus = "in_progress" | "completed" | "incomplete";

export type SurveyResponse = {
  id: string;
  customerId: string;
  employeeId: string;
  groupId: string;
  status: SurveyResponseStatus;
  startedAt: string;
  completedAt?: string;
  lastActivityAt: string;
  lastQuestionIndex: number;
  lang: string;
  editToken: string;
  finalComment?: string;
  answers: SurveyAnswer[];
};

export type SurveySession = {
  id: string;
  customerId: string;
  employeeId: string;
  groupId: string;
  responseId: string;
  createdAt: string;
  lang: string;
};

export type QuestionType = "rating" | "text" | "yes_no";
export type QuestionCategory =
  | "general"
  | "employee_specific"
  | "feedback"
  | "service"
  | "additional";

export type SurveyQuestion = {
  id: string;
  text: Record<string, string>;
  type: QuestionType;
  category: QuestionCategory;
  required: boolean;
  isPrimary: boolean;
  order: number;
  active: boolean;
};

export type Employee = {
  id: string;
  name: Record<string, string>;
  department: Record<string, string>;
  active: boolean;
  supervisorId?: string;
};

export type UserRole = "admin" | "supervisor" | "employee";

export type User = {
  id: string;
  name: string;
  role: UserRole;
  employeeId?: string;
};

export type SurveyDb = {
  sessions: SurveySession[];
  responses: SurveyResponse[];
  employees: Employee[];
  questions: SurveyQuestion[];
  users: User[];
};
