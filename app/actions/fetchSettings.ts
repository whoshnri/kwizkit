// app/actions/fetchSettings.ts
"use server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function fetchSettings(testId: string) {
  try {
    const test = await prisma.test.findUnique({
      where: { id: testId },
    });

    if (test && test.settings) {
      return {settings: test.settings};
    }

    return { error: "Test not found or has no settings." };
  } catch (error) {
    console.error("[FETCH_SETTINGS_ERROR]", error);
    return { error: "Failed to fetch settings" };
  }
}
