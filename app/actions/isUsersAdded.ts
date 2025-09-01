"use server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function fetchUsers(testId:number): Promise<{ added: boolean } | { error: string }> {
  try {
    const users = await prisma.studentTest.findMany({
      where: { testId : testId },
      take: 1, // Optimize: We only care if *any* exist
    });

    return { added: users.length > 0 };
  } catch (error) {
    console.error("[GET_USERS_ERROR]", error);
    return { error: "Failed to check user uploads" };
  }
}
