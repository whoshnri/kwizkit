import { Plan } from "@/lib/generated/prisma/client";


export type PlanLimits = {
  maxStudents: number;
  maxTestsPerMonth: number | "unlimited";
  maxStorageGB: number;
  aiTokens: number;
  support: "email" | "priority" | "whatsapp" | "dedicated" | "onsite";
};

export const PLAN_CONFIG: Record<Plan, PlanLimits> = {
  solo_paygo: {
    maxStudents: 0, // Pay per student
    maxTestsPerMonth: "unlimited", // Pay per test
    maxStorageGB: 0.05, // Pay per large upload
    aiTokens: 0, // Pay per bundle
    support: "email",
  },
  solo_starter: {
    maxStudents: 50,
    maxTestsPerMonth: 10,
    maxStorageGB: 5,
    aiTokens: 50000,
    support: "email",
  },
  solo_growth: {
    maxStudents: 200,
    maxTestsPerMonth: "unlimited",
    maxStorageGB: 20,
    aiTokens: 500000,
    support: "priority",
  },
  inst_starter: {
    maxStudents: 200,
    maxTestsPerMonth: "unlimited",
    maxStorageGB: 20,
    aiTokens: 500000,
    support: "email",
  },
  inst_school: {
    maxStudents: 1000,
    maxTestsPerMonth: "unlimited",
    maxStorageGB: 100,
    aiTokens: 2000000,
    support: "whatsapp",
  },
  inst_campus: {
    maxStudents: 5000,
    maxTestsPerMonth: "unlimited",
    maxStorageGB: 500,
    aiTokens: 5000000,
    support: "dedicated",
  },
  inst_enterprise: {
    maxStudents: 1000000, // Effectively unlimited
    maxTestsPerMonth: "unlimited",
    maxStorageGB: 10000, // Effectively unlimited
    aiTokens: 100000000, // Effectively unlimited
    support: "onsite",
  },
};
