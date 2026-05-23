"use server";

import prisma from "@/lib/prisma";
import { Gender, Plan } from "@/lib/generated/prisma/client";
import { PLAN_CONFIG } from "@/lib/plans";

type BetterAuthUserPayload = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export async function checkAccount(accountId: string) {
  const account = await prisma.user.findFirst({
    where: { accountId },
  });
  if (!account) {
    return null;
  } else {
    return account;
  }
}

export async function createAccount(
  fullName: string,
  phoneNumber: string,
  email: string,
  gender: Gender,
  city: string,
  image: string,
  accountId: string,
  plan: Plan = "solo_paygo"
) {
  const [firstName = "", ...lastNameParts] = fullName.trim().split(/\s+/);
  const lastName = lastNameParts.join(" ");

  const existingAccount = await prisma.user.findFirst({
    where: {
      OR: [
        { accountId },
        ...(email ? [{ email }] : []),
      ],
    },
  });

  const limits = PLAN_CONFIG[plan];

  const data = {
    firstName,
    lastName,
    phone: phoneNumber,
    email,
    gender,
    city,
    image,
    accountId,
    plan,
    aiTokensRemaining: typeof limits.aiTokens === 'number' ? limits.aiTokens : 0,
  };

  const account = existingAccount
    ? await prisma.user.update({
        where: { id: existingAccount.id },
        data,
      })
    : await prisma.user.create({
        data: {
          ...data,
          wallet: {
            create: {
              name: `${firstName || "User"} wallet`,
              balance: 0,
            },
          },
        },
      });

  return Boolean(account);
}

export async function syncAccountFromBetterAuth(user: BetterAuthUserPayload) {
  if (!user.id) {
    return null;
  }

  const nameParts = (user.name ?? "").trim().split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] ?? null;
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : null;

  const existingAccount = await prisma.user.findFirst({
    where: {
      OR: [
        { accountId: user.id },
        ...(user.email ? [{ email: user.email }] : []),
      ],
    },
  });

  if (existingAccount) {
    return prisma.user.update({
      where: { id: existingAccount.id },
      data: {
        accountId: user.id,
        email: user.email ?? existingAccount.email,
        firstName: firstName ?? existingAccount.firstName,
        lastName: lastName ?? existingAccount.lastName,
        image: user.image ?? existingAccount.image,
      },
    });
  }

  return prisma.user.create({
    data: {
      accountId: user.id,
      email: user.email,
      firstName,
      lastName,
      image: user.image,
      wallet: {
        create: {
          name: `${firstName || "User"} wallet`,
          balance: 0,
        },
      },
    },
  });
}
