"use server";

import prisma from "@/lib/prisma";
import { Gender } from "@/lib/generated/prisma/client";

export type AccountUpdateInput = {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  uniqueId?: string | null;
  image?: string | null;
  gender?: Gender;
  phone?: string | null;
  city?: string | null;
};

async function ensureWallet(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { wallet: true },
  });

  if (!user) return null;
  if (user.wallet) return user.wallet;

  return prisma.wallet.create({
    data: {
      name: `${user.firstName || "User"} wallet`,
      balance: 0,
      user: { connect: { id: user.id } },
    },
  });
}

export async function fetchAccountOverview(userId: string) {
  try {
    const wallet = await ensureWallet(userId);
    const account = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        wallet: {
          include: {
            transactions: { orderBy: { createdAt: "desc" }, take: 5 },
          },
        },
        _count: {
          select: {
            tests: true,
            subjectsCreated: true,
            studentsCreated: true,
            classListsCreated: true,
            certificationsCreated: true,
            attendanceSessions: true,
          },
        },
      },
    });

    if (!account) return { error: "Account not found" };

    const [materials, liveAttempts, testScores] = await Promise.all([
      prisma.subjectMaterial.count({
        where: { subject: { createdById: userId } },
      }),
      prisma.liveTestAttempt.count({
        where: { test: { createdById: userId } },
      }),
      prisma.testScore.count({
        where: { test: { createdById: userId } },
      }),
    ]);

    return {
      account,
      wallet: account.wallet ?? wallet,
      usage: {
        tests: account._count.tests,
        subjects: account._count.subjectsCreated,
        students: account._count.studentsCreated,
        classes: account._count.classListsCreated,
        certificates: account._count.certificationsCreated,
        attendanceSessions: account._count.attendanceSessions,
        materials,
        liveAttempts,
        testScores,
      },
    };
  } catch (error) {
    console.error("[FETCH_ACCOUNT_OVERVIEW_ERROR]", error);
    return { error: "Failed to load account overview" };
  }
}

export async function updateAccount(userId: string, input: AccountUpdateInput) {
  try {
    const account = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        uniqueId: input.uniqueId,
        image: input.image,
        gender: input.gender,
        phone: input.phone,
        city: input.city,
      },
    });

    return { account, message: "Account updated" };
  } catch (error) {
    console.error("[UPDATE_ACCOUNT_ERROR]", error);
    return { error: "Failed to update account" };
  }
}

export async function topUpWallet(userId: string, amount: number) {
  try {
    const wallet = await ensureWallet(userId);
    if (!wallet) return { error: "Wallet not found" };

    const safeAmount = Math.max(0, Math.floor(amount));
    if (!safeAmount) return { error: "Enter a valid top-up amount" };

    await prisma.transaction.create({
      data: {
        walletId: wallet.id,
        amount: safeAmount,
        type: "cr",
      },
    });

    const updatedWallet = await prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: { increment: safeAmount } },
    });

    return { wallet: updatedWallet, message: "Wallet topped up" };
  } catch (error) {
    console.error("[TOP_UP_WALLET_ERROR]", error);
    return { error: "Failed to top up wallet" };
  }
}

export async function fetchTransactions(userId: string) {
  try {
    const wallet = await ensureWallet(userId);
    if (!wallet) return { transactions: [], wallet: null };

    const transactions = await prisma.transaction.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: "desc" },
    });

    return { transactions, wallet };
  } catch (error) {
    console.error("[FETCH_TRANSACTIONS_ERROR]", error);
    return { error: "Failed to load transactions" };
  }
}
