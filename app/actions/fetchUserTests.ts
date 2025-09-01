"use server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function fetchTests(sub: string) {
  try {
    const tests = await prisma.test.findMany({
      orderBy: { createdAt: "desc" },
      where: {
        createdBy: {
          accounts: {
            some: { accountId: sub }, 
          },
        },
      },
      include: { questions: true }, // keep or remove depending on needs
    });

    if (!tests || tests.length === 0) {
      return { message: "No tests found for this account" };
    }

    return { tests };
  } catch (error) {
    console.error("[GET_TESTS_ERROR]", error);
    return { error: "Failed to fetch tests" };
  }
}
