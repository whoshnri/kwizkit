"use server";
import prisma from "@/lib/prisma";
import { $Enums } from "@/lib/generated/prisma/client";
import { InputJsonValue, PrismaClientKnownRequestError } from "@prisma/client/runtime/client";

//create the ops for the test

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
}

function randomSlugSegment() {
  return Math.random().toString(36).slice(2, 9);
}

async function buildTestSlug({
  createdById,
  testName,
}: {
  createdById: string;
  testName: string;
}) {
  const user = await prisma.user.findUnique({
    where: { id: createdById },
    select: {
      firstName: true,
      lastName: true,
      email: true,
      uniqueId: true,
    },
  });

  const userName =
    user?.uniqueId ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.email?.split("@")[0] ||
    createdById;

  const baseSlug = slugify(`${userName} ${testName}`) || "test";

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const slug = `${baseSlug}-${randomSlugSegment()}`;
    const existing = await prisma.test.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing) return slug;
  }

  return `${baseSlug}-${Date.now().toString(36)}`;
}

export async function createTest(data: {
  name: string;
  description: string | null;
  subject: string;
  subjectId?: string;
  difficulty: $Enums.Difficulty;
  visibility: boolean;
  createdById: string;
  settings: InputJsonValue;
  assignedClassIds?: string[];
}) {
  try {
    const slug = await buildTestSlug({
      createdById: data.createdById,
      testName: data.name,
    });

    const test = await prisma.test.create({
      data: {
        id: `kk-test-${data.createdById}-${Date.now()}`,
        name: data.name,
        description: data.description,
        subjectId: data.subjectId || undefined,
        difficulty: data.difficulty,
        slug,
        visibility: data.visibility,
        settings: JSON.stringify(data.settings ?? {}),
        createdById: data.createdById,
        assignedClasses: {
          connect: data.assignedClassIds?.map((id) => ({ id })) || [],
        },
      },
    });
    return {
      message: "Test created successfully",
      status: 201,
      metadata: test.id,
    };
  } catch (error: PrismaClientKnownRequestError | any) {
    console.error("Error creating test:", error);
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
        subject: true,
        questions: true,
        assignedClasses: true,
        liveAttempts: {
          include: {
            student: true,
          },
          orderBy: {
            startedAt: "desc",
          },
        },
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

export async function fetchTestForDashBySlug(slug: string) {
  try {
    const test = await prisma.test.findUnique({
      where: {
        slug,
      },
      include: {
        subject: true,
        questions: true,
        assignedClasses: true,
        liveAttempts: {
          include: {
            student: true,
          },
          orderBy: {
            startedAt: "desc",
          },
        },
      },
    });

    return test ?? null;
  } catch (error) {
    return null;
  }
}

export async function updateTestDetails(
  testId: string,
  data: {
    name: string;
    description: string | null;
    subject: string;
    subjectId?: string;
    difficulty: $Enums.Difficulty;
    visibility: boolean;
    duration?: number;
    assignedClassIds?: string[];
  }
) {
  try {
    const test = await prisma.test.update({
      where: { id: testId },
      data: {
        name: data.name,
        description: data.description,
        subjectId: data.subjectId || null,
        difficulty: data.difficulty,
        visibility: data.visibility,
        duration: data.duration,
        assignedClasses: {
          set: data.assignedClassIds?.map((id) => ({ id })) || [],
        },
      },
    });
    return {
      message: "Test details updated successfully",
      status: 200,
      metadata: test.id,
    };
  } catch (error: PrismaClientKnownRequestError | any) {
    return {
      message: "Failed to update test details",
      status: 500,
      metadata: "Network error",
    };
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
    correctAnswer?: string | null;
    explanation?: string | null;
  }[]
) {
  try {
    const test = await prisma.test.update({
      where: { id: testId },
      data: { 
        name,
        totalMarks,
        numberOfQuestions,
        difficulty,
        description,
        questions : {
          deleteMany: {},
          create: questions.map((question, index) => ({
            ...question,
            options: JSON.stringify(question.options ?? {}),
            order: index + 1,
          })),
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
