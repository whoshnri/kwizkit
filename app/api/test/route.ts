// app/api/tests/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')      // Remove special characters
    .replace(/\s+/g, '-')              // Replace spaces with hyphens
    .replace(/-+/g, '-')               // Replace multiple hyphens
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const testId = searchParams.get("testId");

    if (testId) {
      const test = await prisma.test.findUnique({
        where: { id: testId},
        include: { questions: true },
      });

      if (!test) {
        return NextResponse.json({ error: "Test not found" }, { status: 404 });
      }
      console.log(test)
      return NextResponse.json({ test });
    }

    const tests = await prisma.test.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ tests });
  } catch (error) {
    console.error("[GET_TESTS_ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch tests" }, { status: 500 });
  }
}


export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      name,
      subject,
      format,
      difficulty,
      createdById,
      visibility,
      description,
      settings = {},
    } = body

    const totalMarks = Number(body.totalMarks);
    const numberOfQuestions = Number(body.numberOfQuestions);
    const durationMinutes = Number(body.durationMinutes);


    // Validate required fields
    const missingFields = []
    if (!name) missingFields.push('name')
    if (!subject) missingFields.push('subject')
    if (!format) missingFields.push('format')
    if (!durationMinutes) missingFields.push('durationMinutes')
    if (!difficulty) missingFields.push('difficulty')
    if (!createdById) missingFields.push('createdById')
    if (!visibility) missingFields.push('visibility')

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required field(s): ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Generate unique slug
    const baseSlug = generateSlug(name)
    let slug = baseSlug
    let count = 1
    while (await prisma.test.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${count++}`
    }


    // Create test
    const test = await prisma.test.create({
      data: {
        name,
        subject,
        format,
        totalMarks,
        durationMinutes,
        numberOfQuestions,
        difficulty,
        createdById,
        slug,
        visibility,
        description,
        settings,
      },
    })

    return NextResponse.json({ success: true, test }, { status: 201 })
  } catch (err) {
    console.error('[CREATE_TEST_ERROR]', err)
    return NextResponse.json(
      { error: 'An error occurred while creating the test' },
      { status: 500 }
    )
  }
}



export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { testId } = body;

    if (!testId) {
      return NextResponse.json(
        { error: 'Missing required field: testId' },
        { status: 400 }
      );
    }

    const existing = await prisma.test.findUnique({
      where: { id: testId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    await prisma.test.delete({
      where: { id: testId },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE_TEST_ERROR]', err);
    return NextResponse.json(
      { error: 'An error occurred while deleting the test' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      name,
      subject,
      format,
      difficulty,
      visibility,
      description,
      settings,
      totalMarks,
      durationMinutes,
      numberOfQuestions,
      questions = [],
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Missing required field: testId' },
        { status: 400 }
      );
    }

    const existingTest = await prisma.test.findUnique({
      where: { id },
      include: { questions: true },
    });

    if (!existingTest) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    // --- Update Test Fields ---
    const updatedTest = await prisma.test.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(subject && { subject }),
        ...(format && { format }),
        ...(difficulty && { difficulty }),
        ...(visibility && { visibility }),
        ...(description !== undefined && { description }),
        ...(settings && typeof settings === 'object' && { settings }),
        ...(totalMarks !== undefined && { totalMarks: Number(totalMarks) }),
        ...(durationMinutes !== undefined && { durationMinutes: Number(durationMinutes) }),
        ...(numberOfQuestions !== undefined && { numberOfQuestions: Number(numberOfQuestions) }),
      },
    });

            // --- Sync Questions ---
        const existingQuestions = existingTest.questions;
        const existingQids = existingQuestions.map((q) => q.qid);
        const updatedQids = questions.map((q: any) => q.qid).filter(Boolean);

        // Delete removed questions
        const idsToDelete = existingQids.filter((qid) => !updatedQids.includes(qid));
        if (idsToDelete.length > 0) {
          await prisma.question.deleteMany({
            where: { qid: { in: idsToDelete } },
          });
        }

        // Upsert (update or create) incoming questions
        console.log(questions)

        for (const q of questions) {
          const {
            qid,
            testId,
            text,
            type,
            options = {},
            correctAnswer,
            correctOption,
            marks,
            explanation,
          } = q;

          // Validation (skip invalid)
          if (!text || !type || marks === undefined) continue;
          if (type === 'multiple_choice' && options.length < 2) continue;

          // Check if a question with this qid exists
          const existing = await prisma.question.findUnique({ where: { qid } });

          if (existing) {
            // Update existing question
            await prisma.question.update({
              where: { qid },
              data: {
                text,
                type,
                options,
                correctAnswer: String(correctAnswer),
                correctOption,
                marks: Number(marks),
                explanation,
              },
            });
          } else {
            // Create new question
            await prisma.question.create({
              data: {
                qid,
                testId,
                text,
                type,
                options,
                correctAnswer: String(correctAnswer),
                correctOption,
                marks: Number(marks),
                explanation,
              },
            });
          }
        }


    return NextResponse.json({ success: true, test: updatedTest });
  } catch (err) {
    console.error('[UPDATE_TEST_WITH_QUESTIONS_ERROR]', err);
    return NextResponse.json(
      { error: 'An error occurred while updating the test' },
      { status: 500 }
    );
  }
}

