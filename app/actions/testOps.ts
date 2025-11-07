"use server";
import { prisma } from "@/lib/prisma";
import { Test, $Enums, Question } from "@prisma/client";
import {
  InputJsonValue,
  PrismaClientKnownRequestError,
} from "@prisma/client/runtime/library";

//create the ops for the test

export async function createTest(data: {
  name: string;
  description: string | null;
  subject: string;
  difficulty: $Enums.Difficulty;
  visibility: boolean;
  createdById: string;
  settings: InputJsonValue;
}) {
  try {
    const test = await prisma.test.create({
      data: {
        id: `kk-test-${data.createdById}-${Date.now()}`,
        name: data.name,
        description: data.description,
        subject: data.subject,
        difficulty: data.difficulty,
        slug: data.name.toLocaleLowerCase().replace(/\s+/g, "-"),
        visibility: data.visibility,
        settings: data.settings,
        createdById: data.createdById,
      },
    });
    return {
      message: "Test created successfully",
      status: 201,
      metadata: test.id,
    };
  } catch (error: PrismaClientKnownRequestError | any) {
    return {
      message: "Failed to create test",
      status: 500,
      metadata: "Network error",
    };
  }
}

export async function deleteTest(testId: string) {
  try {
    await prisma.test.delete({
      where: { id: testId },
    });
    return {
      message: "Test deleted successfully",
      status: 200,
      metadata: null,
    };
  } catch (error: PrismaClientKnownRequestError | any) {
    return {
      message: "Failed to delete test",
      status: 500,
      metadata: "Network error",
    };
  }
}

export async function fetchTestForDash(testId: string) {
  try {
    const test = await prisma.test.findUnique({
      where: {
        id: testId,
      },
      include: {
        questions: true,
      },
    });
    if (test) {
      return test;
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
}


export async function updateTestQuestions(
  testId: string,
  name: string,
  totalMarks: number,
  numberOfQuestions: number,
  subject : string,
  difficulty: $Enums.Difficulty,
  description: string,
  questions: {
    text: string;
    marks: number;
    type: $Enums.QuestionType;
    options: Record<string, string>;
    correctOption: number | null | undefined;
  }[]
) {
  try {
    const test = await prisma.test.update({
      where: { id: testId },
      data: { 
        name,
        totalMarks,
        numberOfQuestions,
        subject,
        difficulty,
        description,
        questions : {
          deleteMany: {},
          create: questions,
        }
      },
    });
    return {
      message: "Test questions updated successfully",
      status: 200,
      metadata: null,
    };
  } 
  catch (error: PrismaClientKnownRequestError | any) {
    return {
      message: "Failed to update test questions",
      status: 500,
      metadata: "Network error",
    };
  } 
}