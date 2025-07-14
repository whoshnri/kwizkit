import {Question} from './question'

export type Test = {
  id: number;
  name: string;
  description?: string;
  subject: string;
  format: "multiple-choice" | "theory" | "mixed";
  totalMarks: number;
  durationMinutes: number;
  numberOfQuestions: number;
  difficulty: "easy" | "medium" | "hard";
  createdAt: string; // ISO date
  updatedAt?: string;
  published: boolean;
  createdBy: {
    id: string;
    name: string;
    role: "tutor" | "school";
  };
  tags?: string[];
  settings: {
    allowRetake: boolean;
    shuffleQuestions: boolean;
    timePerQuestion?: number; // in seconds (optional)
    preventTabSwitching: boolean;
  };
  visibility: "private" | "public" ;
  questions?: Question[];
};
