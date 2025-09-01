// app/api/tests/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Test } from "@/lib/test";
import { InputJsonValue, JsonValue } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const testId = searchParams.get("testId");

    if (testId) {
      const test = await prisma.test.findUnique({
        where: { id: testId },
        include: { questions: true },
      });

      if (!test) {
        return NextResponse.json({ error: "Test not found" }, { status: 404 });
      }
      console.log(test);
      return NextResponse.json({ test });
    }

    const tests = await prisma.test.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ tests });
  } catch (error) {
    console.error("[GET_TESTS_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch tests" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      subject,
      difficulty,
      createdById,
      visibility,
      description,
      settings = {},
    } = body;

    const totalMarks = Number(body.totalMarks);
    const numberOfQuestions = Number(body.numberOfQuestions);

    // Validate required fields
    const missingFields = [];
    if (!name) missingFields.push("name");
    if (!subject) missingFields.push("subject");
    if (!difficulty) missingFields.push("difficulty");
    if (!createdById) missingFields.push("createdById");

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required field(s): ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    // Generate unique slug
    const baseSlug = generateSlug(name);
    let slug = baseSlug;
    let count = 1;

    while (await prisma.test.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${count++}`;
    }

    const creator = await prisma.account.findUnique({
      where: { accountId: createdById },
    });

    if (!creator) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const creatorId = creator.userId;

    const test = await prisma.test.create({
      data: {
        name,
        subject,
        totalMarks,
        numberOfQuestions,
        difficulty,
        createdById: creatorId,
        slug,
        visibility,
        description,
        settings,
      },
    });

    return NextResponse.json({ success: true, test }, { status: 201 });
  } catch (err) {
    console.error("[CREATE_TEST_ERROR]", err);
    return NextResponse.json(
      { error: "An error occurred while creating the test" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { testId } = body;

    if (!testId) {
      return NextResponse.json(
        { error: "Missing required field: testId" },
        { status: 400 }
      );
    }

    const existing = await prisma.test.findUnique({
      where: { id: testId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    await prisma.test.delete({
      where: { id: testId },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE_TEST_ERROR]", err);
    return NextResponse.json(
      { error: "An error occurred while deleting the test" },
      { status: 500 }
    );
  }
}
export async function PATCH(req: NextRequest) {
  try {
    const body: Test = await req.json();
    console.log(body);
    const {
      id,
      name,
      subject,
      difficulty,
      description,
      totalMarks,
      numberOfQuestions,
      questions = [],
    } = body;
    let slug;
    if (name) {
      const base = generateSlug(name ?? "test");
      let probe = base;
      let count = 1;

      while (true) {
        const found = await prisma.test.findUnique({ where: { slug: probe } });
        if (!found || found.id === id) {
          slug = probe;
          break;
        }
        probe = `${base}-${count++}`;
      }
    }

    if (!id) {
      return NextResponse.json(
        { error: "Missing required field: testId" },
        { status: 400 }
      );
    }

    const existingTest = await prisma.test.findUnique({
      where: { id },
      include: { questions: true },
    });

    if (!existingTest) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    // --- Update Test Fields ---
    const updatedTest = await prisma.test.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(subject && { subject }),
        ...(slug && { slug }),
        ...(difficulty && { difficulty }),
        // allow setting description to null explicitly
        ...(Object.prototype.hasOwnProperty.call(body, "description") && { description }),
        ...(totalMarks !== undefined && { totalMarks: Number(totalMarks) }),
        ...(numberOfQuestions !== undefined && {
          numberOfQuestions: Number(numberOfQuestions),
        }),
      },
    });

    // --- Sync Questions ---
    const existingQuestions = existingTest.questions;
    const existingQids = existingQuestions.map((q) => q.id);

    // incoming DB ids (use q.id — q.qid is client-only temp id)
    const incomingDbIds = (questions || [])
      .map((q: any) => (q.id ? String(q.id) : undefined))
      .filter(Boolean) as string[];

    // Delete removed questions (those present in DB but not in incoming payload)
    const idsToDelete = existingQids.filter((dbId) => !incomingDbIds.includes(dbId));
    if (idsToDelete.length > 0) {
      await prisma.question.deleteMany({
        where: { id: { in: idsToDelete } },
      });
    }

    // Upsert (update or create) incoming questions
    console.log(questions);

    for (const q of questions ?? []) {
      const {
        id: qId,
        testId,
        text,
        type,
        options = {},
        correctAnswer,
        correctOption,
        marks,
        explanation,
      } = q as any;

      // Validation (skip invalid)
      if (!text || !type || marks === undefined) continue;

      // Validate options for multiple_choice: accept array or object
      let optionCount = 0;
      if (Array.isArray(options)) {
        optionCount = options.length;
      } else if (options && typeof options === "object") {
        optionCount = Object.keys(options).length;
      } else {
        optionCount = 0;
      }
      if (type === "multiple_choice" && optionCount < 2) {
        continue;
      }

      // If qId is provided, try update; otherwise create new
      if (qId) {
        // Only update if the question exists in DB (defensive)
        const existing = await prisma.question.findUnique({ where: { id: qId } });
        if (existing) {
          await prisma.question.update({
            where: { id: qId },
            data: {
              text,
              type,
              options: options as InputJsonValue,
              correctAnswer: correctAnswer != null ? String(correctAnswer) : null,
              correctOption: correctOption ?? null,
              marks: Number(marks),
              explanation,
            },
          });
          continue;
        }
        // if qId was provided but not found in DB, fallthrough to create
      }

      // CREATE new question (do not pass undefined id)
      await prisma.question.create({
        data: {
          testId: testId ?? id, // prefer provided testId but fall back to current test id
          text,
          type,
          options: options as InputJsonValue,
          correctAnswer: correctAnswer != null ? String(correctAnswer) : null,
          correctOption: correctOption ?? null,
          marks: Number(marks),
          explanation,
        },
      });
    }

    // Return up-to-date test with questions
    const fresh = await prisma.test.findUnique({
      where: { id: updatedTest.id },
      include: { questions: true },
    });

    return NextResponse.json({ success: true, test: fresh || updatedTest });
  } catch (err) {
    console.error("[UPDATE_TEST_WITH_QUESTIONS_ERROR]", err);
    return NextResponse.json(
      { error: "An error occurred while updating the test" },
      { status: 500 }
    );
  }
}
