"use server";

import prisma from "@/lib/prisma";
import { Plan } from "@/lib/generated/prisma/client";
import { revalidatePath } from "next/cache";
export { PLAN_CONFIG } from "@/lib/plans";
import { PLAN_CONFIG } from "@/lib/plans";

export async function updateUserPlan(userId: string, plan: Plan) {
  try {
    const limits = PLAN_CONFIG[plan];
    
    // Mocking transaction flow: In a real app, you'd verify payment here
    
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        plan: plan,
        aiTokensRemaining: typeof limits.aiTokens === 'number' ? limits.aiTokens : 0,
        planExpiresAt: plan === 'solo_paygo' ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    revalidatePath("/dashboard/account");
    return { success: true, user };
  } catch (error) {
    console.error("[UPDATE_USER_PLAN_ERROR]", error);
    return { error: "Failed to update plan" };
  }
}

export async function getPlanDetails(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        plan: true,
        aiTokensRemaining: true,
        planExpiresAt: true,
      },
    });

    if (!user) return { error: "User not found" };

    return {
      plan: user.plan,
      limits: PLAN_CONFIG[user.plan],
      aiTokensRemaining: user.aiTokensRemaining,
      planExpiresAt: user.planExpiresAt,
    };
  } catch (error) {
    console.error("[GET_PLAN_DETAILS_ERROR]", error);
    return { error: "Failed to fetch plan details" };
  }
}
