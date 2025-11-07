"use server";

import { prisma } from "@/lib/prisma";
import { Gender } from "@prisma/client";

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



export async function createAccount(fullName: string, phoneNumber: string, email: string, gender: Gender, city: string, image: string, accountId: string) {
  const account = await prisma.user.create({
    data: {
      firstName: fullName.split(" ")[0],
      lastName: fullName.split(" ")[1],
      phone: phoneNumber,
      email,
      gender,
      city, 
      image,
      accountId
    },
  });

  if (!account) {
    return false
  }
  else{
    return true
  }
}