"use server";
import prisma from "@/lib/prisma";
import {Settings} from "@/lib/setting"


export async function saveSettings(testId: string, settings: Settings){
  try {
    const test = await prisma.test.findUnique({
      where: { id: testId },
    });

    if (test) {
      await prisma.test.update({
        where: { id: testId },
        data: {
          settings: JSON.stringify(settings),
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
