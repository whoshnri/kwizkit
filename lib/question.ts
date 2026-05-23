import { Prisma } from "./generated/prisma/client";

export interface Settings extends Prisma.JsonObject {
  general: {
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
  };
  security: {
    enableTabSwitching: boolean;
    disableCopyPaste: boolean;
  };
  users: {
    usersAdded: boolean;
  };
  testTime: number;
}


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