import { Prisma } from "@prisma/client";
export type Question = {
  id: string;
  testId: string;
  text: string;
  type: "multiple_choice" | "short_answer" | "essay" | "true_or_false";
  options?: Prisma.JsonValue;
  correctOption?: number | null;
  correctAnswer?: string | null;
  marks: number;
  explanation?: string | null;
};