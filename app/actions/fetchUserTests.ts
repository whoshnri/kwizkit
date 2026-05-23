"use server";
import prisma from "@/lib/prisma";

export async function fetchTests(sub: string) {
  try {
    const tests = await prisma.test.findMany({
      orderBy: { createdAt: "desc" },
      where: {
        createdBy: {
          id: sub
        }
      },
      include: { 
        subject: true,
        questions: true,
        assignedClasses: true,
      }, 
    });

    if (!tests || tests.length === 0) {
      return { message: "No tests found for this account" };
    }

    return {
      tests: tests.map((test) => ({
        ...test,
        subjectName: test.subject?.name ?? "",
      })),
    };
  } catch (error) {
    console.error("[GET_TESTS_ERROR]", error);
    return { error: "Failed to fetch tests" };
  }
}
