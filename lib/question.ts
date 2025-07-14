export type Question = {
  testId: number | string;
  qid : string;
  id: number;
  text: string;
  type: "multiple-choice" | "short-answer" | "long-answer";
  options?: string[];
  correctAnswer?: string | string[] | number; // flexible
  marks: number;
  explanation?: string;
};
