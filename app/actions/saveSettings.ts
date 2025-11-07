"use server";
import { PrismaClient} from "@prisma/client";
import {Settings} from "@/lib/setting"

const prisma = new PrismaClient();

export async function saveSettings(testId: string, settings: Settings){
  try {
    const test = await prisma.test.findUnique({
      where: { id: testId },
    });

    if (test) {
      await prisma.test.update({
        where: { id: testId },
        data: {
          settings: settings,
        },
      });
      return { success: true };
    }

    return { error: "Test not found" };
  } catch (error) {
    console.error("[SAVE_SETTINGS_ERROR]", error);
    return { error: "Failed to save settings" };
  }
}
