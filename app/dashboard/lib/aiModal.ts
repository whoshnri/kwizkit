import { v4 as uuidv4 } from "uuid";

export type AiUseCase = "revise" | "create";

export type AiQuestionType =
  | "multiple_choice"
  | "short_answer"
  | "essay"
  | "true_or_false";

export type AiImportMode = "upsert" | "append";

export type AiQuestion = {
  id: string;
  testId: string;
  text: string;
  type: AiQuestionType;
  options: Record<string, string>;
  correctOption?: number | null;
  correctAnswer?: string | null;
  marks: number;
  explanation?: string | null;
};

export enum AiModalStep {
  Onboarding,
  UseCaseSelection,
  Configuration,
  Loading,
  Review,
}

export function buildAIGenerationPrompt({
  subject,
  numQuestions,
  prompt,
  questionTypes,
  questionTypeInstructions,
}: {
  subject: string;
  numQuestions: number;
  prompt: string;
  questionTypes: AiQuestionType[];
  questionTypeInstructions: Record<AiQuestionType, string>;
}) {
  const selectedTypes: AiQuestionType[] =
    questionTypes.length > 0 ? questionTypes : ["multiple_choice"];
  const typeInstructions = selectedTypes
    .map((type) => {
      const instruction = questionTypeInstructions[type]?.trim();
      return `- ${type}${instruction ? `: ${instruction}` : ""}`;
    })
    .join("\n");

  return `
      Subject: ${subject || "General"}
      Number of Questions to Generate: ${numQuestions}
      Allowed Question Types:
      ${selectedTypes.join(", ")}
      Question Type Guidance:
      ${typeInstructions}
      ---
      User Prompt:
      ${prompt}
    `;
}

export function parseAIQuestions(response: unknown): AiQuestion[] {
  if (
    !response ||
    typeof response !== "object" ||
    !Array.isArray((response as { metadata?: unknown }).metadata)
  ) {
    console.error("Invalid AI response structure:", response);
    return [];
  }

  return (response as { metadata: Array<Record<string, unknown>> }).metadata.map((item) => {
    const options =
      item.opt && typeof item.opt === "object" && !Array.isArray(item.opt)
        ? (item.opt as Record<string, string>)
        : {};

    return {
      id: uuidv4(),
      testId: "",
      text: typeof item.text === "string" ? item.text : "",
      type: (item.type as AiQuestionType) ?? "multiple_choice",
      options,
      correctOption:
        typeof item.correctOpt === "number"
          ? item.correctOpt
          : typeof item.correctOption === "number"
            ? item.correctOption
            : null,
      correctAnswer: typeof item.correctAnswer === "string" ? item.correctAnswer : null,
      marks: 1,
      explanation: typeof item.explanation === "string" ? item.explanation : null,
    };
  });
}
