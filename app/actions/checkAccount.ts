"use server";

import { prisma } from "@/lib/prisma";

export async function checkAccount(accountId: string) {
  const account = await prisma.account.findFirst({
    where: { accountId : accountId },
  });

  return !!account;
}
