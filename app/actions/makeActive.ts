"use server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function saveSettings(testId: string){
  try {
    const test = await prisma.test.findUnique({
      where: { id: testId },
    })

    if (test) {
      await prisma.test.update({
        where: { id: testId },
        data: {
          visibility : true,
        }
      })
      return { success: true };
    }

    return { error: "Test not found" };
  } catch (error) {
    console.error("[SAVE_SETTINGS_ERROR]", error);
    return { error: "Failed to save settings" };
  }
}

export async function makePrivate(testId: string){
  try {
    const test = await prisma.test.findUnique({
      where: { id: testId },
    })
    if (test) {
      await prisma.test.update({
        where: { id: testId },
        data: {
          visibility : false,
        }
      })
      return { success: true };
    }
    return { error: "Test not found" };
  } catch (error) {
    console.error("[MAKE_PRIVATE_ERROR]", error);
    return { error: "Failed to make test private" };
  }
}

export async function makePublic(testId: string, duration: number){
  try {
    const test = await prisma.test.findUnique({
      where: { id: testId },
    })
    if (test) {
      await prisma.test.update({
        where: { id: testId },
        data: {
          visibility : true,
          duration,
        }
      })
      return { success: true };
    }
    return { error: "Test not found" };
  } catch (error) {
    console.error("[MAKE_PRIVATE_ERROR]", error);
    return { error: "Failed to make test public" };
  }
}

