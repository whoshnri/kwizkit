import {Question} from "./question";
import { Settings } from "./setting";


export type Test = {
  id: string;
  name: string;
  description: string | null;
  subject: string | { name?: string | null } | null;
  subjectId?: string | null;
  subjectName?: string | null;
  totalMarks: number;
  numberOfQuestions: number;
  difficulty: "easy" | "medium" | "hard";
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  duration?: number;
  slug: string;
  settings: Settings
  visibility: boolean;
  questions?: Question[] | null;
};
