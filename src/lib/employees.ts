import type { Lang } from "./i18n";

export type Employee = {
  id: string;
  name: Record<Lang, string>;
  department: Record<Lang, string>;
  active?: boolean;
  supervisorId?: string;
};

export const employees: Employee[] = [
  {
    id: "EMP-001",
    name: {
      fa: "مینا رضایی",
      en: "Mina Rezaei",
      ar: "مينا رضائي",
    },
    department: {
      fa: "منابع انسانی",
      en: "Human Resources",
      ar: "الموارد البشرية",
    },
    active: true,
  },
  {
    id: "EMP-002",
    name: {
      fa: "علی مرادی",
      en: "Ali Moradi",
      ar: "علي مرادي",
    },
    department: {
      fa: "پشتیبانی",
      en: "Support",
      ar: "الدعم",
    },
    active: true,
  },
  {
    id: "EMP-003",
    name: {
      fa: "سارا موسوی",
      en: "Sara Mousavi",
      ar: "سارة موسوي",
    },
    department: {
      fa: "مالی",
      en: "Finance",
      ar: "المالية",
    },
    active: true,
  },
  {
    id: "EMP-004",
    name: {
      fa: "حمید کاظمی",
      en: "Hamid Kazemi",
      ar: "حميد كاظمي",
    },
    department: {
      fa: "فناوری اطلاعات",
      en: "IT",
      ar: "تقنية المعلومات",
    },
    active: true,
  },
  {
    id: "EMP-005",
    name: {
      fa: "نگار احمدی",
      en: "Negar Ahmadi",
      ar: "نجار أحمدي",
    },
    department: {
      fa: "امور مشتریان",
      en: "Customer Care",
      ar: "رعاية العملاء",
    },
    active: true,
  },
];
