"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

type ActionResult<T = null> = {
  status: number;
  message: string;
  metadata: T;
};

export type LiveQuestionOption = {
  key: string;
  value: string;
};

export type LiveQuestion = {
  id: string;
  text: string;
  type: "multiple_choice" | "short_answer" | "essay" | "true_or_false";
  marks: number;
  options: LiveQuestionOption[];
  order: number;
};

export type LiveTestPayload = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  subject: string;
  duration: number;
  totalMarks: number;
  numberOfQuestions: number;
  ownerName: string;
  rules: string[];
  questions: LiveQuestion[];
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function titleCase(value: string) {
  return value
    .split(/[\s._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function splitStudentName(email: string) {
  const localPart = email.split("@")[0] || "Student";
  const name = titleCase(localPart) || "Student";
  const [firstName, ...rest] = name.split(" ");

  return {
    firstName: firstName || "Student",
    lastName: rest.join(" ") || "Learner",
  };
}

function normalizeOptions(options: unknown): LiveQuestionOption[] {
  if (!options) return [];

  const parsedOptions =
    typeof options === "string"
      ? (() => {
          try {
            return JSON.parse(options);
          } catch {
            return null;
          }
        })()
      : options;

  if (Array.isArray(parsedOptions)) {
    return parsedOptions.map((value, index) => ({
      key: String.fromCharCode(65 + index),
      value: String(value),
    }));
  }

  if (typeof parsedOptions === "object") {
    return Object.entries(parsedOptions as Record<string, unknown>).map(([key, value]) => ({
      key,
      value: String(value),
    }));
  }

  return [];
}

function parseRules(settings: unknown): string[] {
  const parsedSettings =
    typeof settings === "string"
      ? (() => {
          try {
            return JSON.parse(settings);
          } catch {
            return null;
          }
        })()
      : settings;

  if (!parsedSettings || typeof parsedSettings !== "object") {
    return [
      "Keep one browser tab open for the duration of the test.",
      "Camera and microphone access must remain enabled.",
      "Do not copy, paste, or use external browsing during the attempt.",
      "Submit only when you are ready to lock the session.",
    ];
  }

  const maybeRules = (parsedSettings as { rules?: unknown }).rules;
  if (Array.isArray(maybeRules)) {
    return maybeRules.map(String).filter(Boolean);
  }

  return [
    "Keep one browser tab open for the duration of the test.",
    "Camera and microphone access must remain enabled.",
    "Do not copy, paste, or use external browsing during the attempt.",
    "Submit only when you are ready to lock the session.",
  ];
}

export async function getPublicLiveTest(testSlug: string): Promise<LiveTestPayload | null> {
  const test = await prisma.test.findUnique({
    where: { slug: testSlug },
    include: {
      questions: {
        orderBy: [{ order: "asc" }, { id: "asc" }],
      },
      createdBy: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      subject: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!test || !test.visibility) return null;

  const ownerName =
    [test.createdBy.firstName, test.createdBy.lastName].filter(Boolean).join(" ") ||
    test.createdBy.email ||
    "Test owner";

  const questions = test.questions.map((question, index) => ({
    id: question.id,
    text: question.text,
    type: question.type,
    marks: question.marks,
    options: normalizeOptions(question.options),
    order: question.order || index + 1,
  }));

  return {
    id: test.id,
    slug: test.slug,
    name: test.name,
    description: test.description,
    subject: test.subject?.name ?? "No subject",
    duration: test.duration ?? 0,
    totalMarks:
      test.totalMarks ?? questions.reduce((sum, question) => sum + question.marks, 0),
    numberOfQuestions: test.numberOfQuestions ?? questions.length,
    ownerName,
    rules: parseRules(test.settings),
    questions,
  };
}

export async function requestLiveAccessOtp(
  testSlug: string,
  email: string
): Promise<ActionResult<{ email: string }>> {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    return { status: 400, message: "Enter a valid email address.", metadata: { email } };
  }

  const test = await prisma.test.findUnique({
    where: { slug: testSlug },
    select: { id: true, visibility: true, createdById: true, assignedClasses: { select: { id: true } } },
  });

  if (!test || !test.visibility) {
    return { status: 404, message: "This test is not available.", metadata: { email } };
  }

  // Access control for assigned classes
  if (test.assignedClasses.length > 0) {
    const student = await prisma.student.findFirst({
      where: {
        email: normalizedEmail,
        classLists: {
          some: {
            classListId: {
              in: test.assignedClasses.map((c) => c.id),
            },
          },
        },
      },
    });

    if (!student) {
      return {
        status: 403,
        message: "You are not authorized to take this test. Please contact your instructor.",
        metadata: { email },
      };
    }
  }

  return {
    status: 200,
    message: "Mock OTP sent. Any code will work for now.",
    metadata: { email: normalizedEmail },
  };
}

export async function verifyLiveAccessOtp(
  testSlug: string,
  email: string,
  otp: string
): Promise<
  ActionResult<{
    attemptId: string;
    email: string;
    studentName: string;
  } | null>
> {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    return { status: 400, message: "Enter a valid email address.", metadata: null };
  }

  if (!otp.trim()) {
    return { status: 400, message: "Enter the OTP sent to your email.", metadata: null };
  }

  const test = await prisma.test.findUnique({
    where: { slug: testSlug },
    select: { id: true, visibility: true, createdById: true },
  });

  if (!test || !test.visibility) {
    return { status: 404, message: "This test is not available.", metadata: null };
  }

  const existingStudent = await prisma.student.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, firstName: true, lastName: true },
  });

  const student =
    existingStudent ??
    (await prisma.student.create({
      data: {
        ...splitStudentName(normalizedEmail),
        email: normalizedEmail,
        level: "ss1",
        studentId: `live-${Date.now().toString(36)}`,
        createdById: test.createdById,
      },
      select: { id: true, firstName: true, lastName: true },
    }));

  const attempt = await prisma.liveTestAttempt.create({
    data: {
      testId: test.id,
      studentId: student.id,
      passwordUsed: false,
    },
    select: { id: true },
  });

  return {
    status: 200,
    message: "Access verified.",
    metadata: {
      attemptId: attempt.id,
      email: normalizedEmail,
      studentName: [student.firstName, student.lastName].filter(Boolean).join(" "),
    },
  };
}

export async function completeLiveSetup(attemptId: string): Promise<ActionResult> {
  if (!attemptId) {
    return { status: 400, message: "Missing test attempt.", metadata: null };
  }

  await prisma.liveTestAttempt.update({
    where: { id: attemptId },
    data: { setupCompleted: true },
  });

  return { status: 200, message: "Setup completed.", metadata: null };
}

export async function submitLiveAttempt({
  attemptId,
  answers,
  flagged,
}: {
  attemptId: string;
  answers: Record<string, string | number | null>;
  flagged: string[];
}): Promise<ActionResult<{ score: number; totalMarks: number } | null>> {
  const attempt = await prisma.liveTestAttempt.findUnique({
    where: { id: attemptId },
    include: { test: { include: { questions: true } } },
  });

  if (!attempt) {
    return { status: 404, message: "Attempt not found.", metadata: null };
  }

  const score = attempt.test.questions.reduce((sum, question) => {
    const answer = answers[question.id];

    if (question.type === "multiple_choice" && typeof answer === "number") {
      return answer === question.correctOption ? sum + question.marks : sum;
    }

    if (question.type === "true_or_false") {
      const expected = String(question.correctAnswer ?? question.correctOption ?? "")
        .trim()
        .toLowerCase();
      const received = String(answer ?? "").trim().toLowerCase();
      return expected && expected === received ? sum + question.marks : sum;
    }

    return sum;
  }, 0);

  const totalMarks =
    attempt.test.totalMarks ??
    attempt.test.questions.reduce((sum, question) => sum + question.marks, 0);

  await prisma.liveTestAttempt.update({
    where: { id: attemptId },
    data: {
      answers: JSON.stringify(answers),
      flagged: JSON.stringify(flagged),
      score,
      totalMarks,
      submittedAt: new Date(),
    },
  });

  revalidatePath(`/live/${attempt.test.slug}/test`);

  return {
    status: 200,
    message: "Test submitted.",
    metadata: { score, totalMarks },
  };
}
