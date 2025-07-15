"use server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function fetchTests(userId: string) {
  try {
    const tests = await prisma.test.findMany({
      orderBy: { createdAt: "desc" },
      where: { createdById: userId },
      include: { questions: true },
    });

    return { tests };
  } catch (error) {
    console.error("[GET_TESTS_ERROR]", error);
    return { error: "Failed to fetch tests" };
  }
}
