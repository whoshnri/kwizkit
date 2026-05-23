"use server";

import prisma from "@/lib/prisma";

export async function fetchDashboardSummary(userId: string) {
  try {
    const [
      totalTests,
      publicTests,
      draftTests,
      totalQuestions,
      students,
      classLists,
      subjects,
      materials,
      certificates,
      recentTests,
      recentStudents,
      recentMaterials,
      recentTransactions,
      wallet,
      liveAttempts,
    ] =
      await Promise.all([
        prisma.test.count({ where: { createdById: userId } }),
        prisma.test.count({ where: { createdById: userId, visibility: true } }),
        prisma.test.count({ where: { createdById: userId, visibility: false } }),
        prisma.question.count({ where: { test: { createdById: userId } } }),
        prisma.student.count({ where: { createdById: userId } }),
        prisma.classList.count({ where: { createdById: userId } }),
        prisma.subject.count({ where: { createdById: userId } }),
        prisma.subjectMaterial.count({ where: { subject: { createdById: userId } } }),
        prisma.certification.count({ where: { createdById: userId } }),
        prisma.test.findMany({
          where: { createdById: userId },
          orderBy: { updatedAt: "desc" },
          take: 5,
          select: {
            id: true,
            name: true,
            slug: true,
            subject: true,
            visibility: true,
            updatedAt: true,
            numberOfQuestions: true,
            _count: { select: { questions: true } },
          },
        }),
        prisma.student.findMany({
          where: { createdById: userId },
          orderBy: { createdAt: "desc" },
          take: 4,
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            level: true,
            isActive: true,
            createdAt: true,
          },
        }),
        prisma.subjectMaterial.findMany({
          where: { subject: { createdById: userId } },
          orderBy: { createdAt: "desc" },
          take: 4,
          include: {
            subject: { select: { name: true } },
          },
        }),
        prisma.transaction.findMany({
          where: { wallet: { user: { id: userId } } },
          orderBy: { createdAt: "desc" },
          take: 4,
        }),
        prisma.wallet.findFirst({
          where: { user: { id: userId } },
          select: { balance: true },
        }),
        prisma.liveTestAttempt.count({ where: { test: { createdById: userId } } }),
      ]);

    return {
      summary: {
        totalTests,
        publicTests,
        draftTests,
        totalQuestions,
        students,
        classLists,
        subjects,
        materials,
        certificates,
        recentTests,
        recentStudents,
        recentMaterials,
        recentTransactions,
        walletBalance: wallet?.balance ?? 0,
        liveAttempts,
      },
    };
  } catch (error) {
    console.error("[FETCH_DASHBOARD_SUMMARY_ERROR]", error);
    return { error: "Failed to load dashboard summary" };
  }
}
