import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { details } = await req.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      gender,
      image,
      provider,
      providerAccountId,
      city,
      role,
      accountId
    } = details;

    // 1. Find or create user
    let user = await prisma.user.findUnique({ 
      where: { email }, 
      include: { accounts: true } 
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          phone,
          gender,
          image,
          city,
          role,
        },
        include: { accounts: true },
      });
    }

    await prisma.account.create({
      data: { userId: user.id, provider, providerAccountId, accountId },
    });

    return Response.json({ success: true, user }, { status: user ? 200 : 201 });
  } catch (err) {
    console.error("Error creating user/account:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
