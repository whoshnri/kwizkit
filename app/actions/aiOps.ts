"use server";

import { z } from "zod";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

// ------------------------------
// Zod Schema Definitions
// ------------------------------

// Schema for Multiple Choice questions
const MultipleChoiceSchema = z.object({
  type: z.enum(["multiple_choice"]),
  text: z.string().describe("The question text."),
  opt: z.object({
    A: z.string().describe("Option A text."),
    B: z.string().describe("Option B text."),
    C: z.string().describe("Option C text."),
    D: z.string().describe("Option D text."),
  }),
  correctOpt: z
    .number()
    .min(0)
    .max(3)
    .describe("The index of the correct option (0=A, 1=B, 2=C, 3=D)."),
  explanation: z
    .string()
    .nonempty()
    .describe("A concise explanation of why the chosen option is correct."),
  correctAnswer: z
    .string()
    .optional()
    .describe(
      "Optional: The letter of the correct option (A, B, C, D) for user display."
    ),
});

const OtherTypesSchema = z.object({
  type: z.enum(["short_answer", "essay", "true_or_false"]),
  text: z.string().describe("The question text."),
  correctOption: z
    .number()
    .min(0)
    .max(1)
    .describe(
      "The index of the correct option (0 = True , 1 = False) Leave as 0 for non true_or_false types."
    ),
  explanation: z
    .string()
    .nonempty()
    .describe("The explanation/rationale for the question/answer."),
  correctAnswer: z
    .string()
    .nonempty()
    .describe(
      "The expected correct answer (e.g., 'True', a short phrase, or an ideal essay point)."
    ),
});

// Overall schema for the AI's final JSON response
const AIResponseSchema = z.object({
  preface: z
    .string()
    .min(1)
    .describe("A friendly, brief introduction to the generated questions."),
  metadata: z
    .array(
      z.union([MultipleChoiceSchema, OtherTypesSchema])
    )
    .describe("An array of generated questions."),
});

const AIState = z.object({
  prompt: z.string().min(1, "Prompt cannot be empty"),
  textFileContext: z.string().nullable(),
  response: AIResponseSchema.nullable(),
});

type AIStateType = z.infer<typeof AIState>;

const AI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
const AI_TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS ?? 30_000);
const MAX_CONTEXT_CHARS = Number(process.env.AI_MAX_CONTEXT_CHARS ?? 24_000);

function createStructuredModel() {
  return new ChatGoogleGenerativeAI({
    model: AI_MODEL,
    temperature: 0.5,
    maxRetries: 0,
    maxOutputTokens: 4096,
    apiKey: process.env.GEMINI_API_KEY,
  }).withStructuredOutput(AIResponseSchema);
}

const prepareStateNode = async (
  state: AIStateType
): Promise<Partial<AIStateType>> => {
  console.log("Preparing prompt and context for LLM...");
  const trimmedContext = (state.textFileContext ?? "").slice(0, MAX_CONTEXT_CHARS);

  return {
    prompt: `Generate questions based on: ${state.prompt}`,
    textFileContext: trimmedContext ? `\nUser Uploaded Context:\n${trimmedContext}` : "",
  };
};

const generateResponseNode = async (
  state: AIStateType
): Promise<Partial<AIStateType>> => {
  console.log(`Generating structured AI response with ${AI_MODEL}...`);
  const fullPrompt = `${state.prompt}\n${state.textFileContext}`;
  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), AI_TIMEOUT_MS);

  try {
    const response = await createStructuredModel().invoke(
      [
        {
          role: "system",
          content:
            "You are an expert AI question generator. Return exactly the requested number of questions as structured JSON. Use only the allowed question types from the user prompt. Follow the per-type guidance closely. Keep explanations concise.",
        },
        {
          role: "user",
          content: fullPrompt,
        },
      ],
      { signal: abortController.signal }
    );

    return {
      response,
    };
  } finally {
    clearTimeout(timeout);
  }
};

function isQuotaError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    (error as { status?: unknown }).status === 429
  );
}

function isAbortError(error: unknown) {
  return error instanceof Error && error.name === "AbortError";
}

export async function run(initialPrompt: string, fileText: string) {
  try {
    const initialState = {
      prompt: initialPrompt,
      textFileContext: fileText,
      response: null,
    };

    const preparedState = {
      ...initialState,
      ...(await prepareStateNode(initialState)),
    };
    const result = await generateResponseNode(preparedState);

    console.log("✅ AI generation complete. AI Response:");
    console.dir(result.response, { depth: null });

    return {
        status: "success",
        metadata: result.response?.metadata || [],
        details : "Questions generated successfully.",
    }

  } catch (error) {
    // Log the detailed error on the server for debugging
    console.error("❌ An error occurred during AI generation:", error);

    if (isQuotaError(error)) {
      return {
        status: "error",
        message: "The AI provider quota is exhausted for the current model. Try again later or switch the configured Gemini model/API plan.",
        details: error instanceof Error ? error.message : "Gemini quota exceeded",
      };
    }

    if (isAbortError(error)) {
      return {
        status: "error",
        message: "The AI request took too long and was stopped. Try fewer questions or a shorter uploaded guide.",
        details: `AI request exceeded ${AI_TIMEOUT_MS}ms`,
      };
    }

    // Return a structured, user-friendly error object to the frontend
    return {
      status: "error",
      message: "An unexpected error occurred while generating questions. The model may be unavailable or the input may be invalid. Please try again later.",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
