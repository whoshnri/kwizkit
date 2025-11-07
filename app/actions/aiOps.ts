"use server";

import { z } from "zod";
import { StateGraph, START, END } from "@langchain/langgraph";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";
import { de } from "zod/v4/locales";

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

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-pro",
  temperature: 0.7, 
  apiKey: process.env.GEMINI_API_KEY,
}).withStructuredOutput(AIResponseSchema);

const prepareStateNode = async (
  state: AIStateType
): Promise<Partial<AIStateType>> => {
  console.log("Preparing prompt and context for LLM...");
  return {
    prompt: `Generate questions based on: ${state.prompt}`,
    textFileContext: `\nUser Uploaded Context:\n${state.textFileContext}`,
  };
};

const generateResponseNode = async (
  state: AIStateType
): Promise<Partial<AIStateType>> => {
  console.log("Generating structured AI response...");
  const fullPrompt = `${state.prompt}\n${state.textFileContext}`;

  const response = await model.invoke([
    {
      role: "system",
      content:
        "You are an expert AI question generator. Analyze the context and the user's request. Output a structured JSON array of diverse questions (multiple choice, short answer, essay, true/false).",
    },
    {
      role: "user",
      content: fullPrompt,
    },
  ]);

  return {
    response,
  };
};

// --- REVISED `run` FUNCTION WITH ERROR HANDLING ---

export async function run(initialPrompt: string, fileText: string) {
  try {
    const initialState = {
      prompt: initialPrompt,
      textFileContext: fileText,
      response: null,
    };

    const graph = new StateGraph(AIState)
      .addNode("prepareState", prepareStateNode)
      .addNode("generateResponse", generateResponseNode)
      .addEdge(START, "prepareState")
      .addEdge("prepareState", "generateResponse")
      .addEdge("generateResponse", END)
      .compile();

    // Run the state machine
    const result = await graph.invoke(initialState);

    console.log("✅ Graph Execution Complete. AI Response:");
    console.dir(result.response, { depth: null });

    return {
        status: "success",
        metadata: result.response?.metadata || [],
        details : "Questions generated successfully.",
    }

  } catch (error) {
    // Log the detailed error on the server for debugging
    console.error("❌ An error occurred during graph execution:", error);

    // Return a structured, user-friendly error object to the frontend
    return {
      status: "error",
      message: "An unexpected error occurred while generating questions. The model may be unavailable or the input may be invalid. Please try again later.",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
}