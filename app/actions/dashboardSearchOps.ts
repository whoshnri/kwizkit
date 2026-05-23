"use server";

import prisma from "@/lib/prisma";

export type DashboardSearchResult = {
  id: string;
  type: "test" | "student" | "class" | "subject" | "material" | "certificate" | "transaction";
  title: string;
  subtitle: string;
  href: string;
};

function includes(value: string | null | undefined, query: string) {
  return (value ?? "").toLowerCase().includes(query);
}

export async function searchDashboard(userId: string, rawQuery: string) {
  const query = rawQuery.trim().toLowerCase();
  if (query.length < 2) return { results: [] as DashboardSearchResult[] };

  try {
    const [tests, students, classes, subjects, materials, certificates, transactions] =
      await Promise.all([
        prisma.test.findMany({
          where: {
            createdById: userId,
            OR: [
              { name: { contains: rawQuery } },
              { slug: { contains: rawQuery } },
              { subject: { is: { name: { contains: rawQuery } } } },
              { description: { contains: rawQuery } },
            ],
          },
          take: 8,
          orderBy: { updatedAt: "desc" },
          include: {
            subject: { select: { name: true } },
          },
        }),
        prisma.student.findMany({
          where: {
            createdById: userId,
            OR: [
              { firstName: { contains: rawQuery } },
              { lastName: { contains: rawQuery } },
              { email: { contains: rawQuery } },
              { studentId: { contains: rawQuery } },
            ],
          },
          take: 8,
          orderBy: { updatedAt: "desc" },
        }),
        prisma.classList.findMany({
          where: {
            createdById: userId,
            OR: [
              { name: { contains: rawQuery } },
              { session: { contains: rawQuery } },
              { description: { contains: rawQuery } },
            ],
          },
          take: 8,
          orderBy: { updatedAt: "desc" },
        }),
        prisma.subject.findMany({
          where: {
            createdById: userId,
            OR: [
              { name: { contains: rawQuery } },
              { code: { contains: rawQuery } },
              { description: { contains: rawQuery } },
            ],
          },
          take: 8,
          orderBy: { updatedAt: "desc" },
        }),
        prisma.subjectMaterial.findMany({
          where: {
            subject: { createdById: userId },
            OR: [{ name: { contains: rawQuery } }],
          },
          take: 8,
          orderBy: { updatedAt: "desc" },
          select: {
            id: true,
            name: true,
            subject: { select: { name: true } },
          },
        }),
        prisma.certification.findMany({
          where: {
            createdById: userId,
            OR: [
              { name: { contains: rawQuery } },
              { description: { contains: rawQuery } },
              { issuedBy: { contains: rawQuery } },
            ],
          },
          take: 8,
          orderBy: { updatedAt: "desc" },
        }),
        prisma.transaction.findMany({
          where: { wallet: { user: { id: userId } } },
          take: 8,
          orderBy: { createdAt: "desc" },
        }),
      ]);

    const transactionMatches = transactions.filter((transaction) =>
      includes(transaction.id, query) ||
      includes(transaction.type, query) ||
      includes(String(transaction.amount), query)
    );

    const results: DashboardSearchResult[] = [
      ...tests.map((test) => ({
        id: test.id,
        type: "test" as const,
        title: test.name,
        subtitle: `${test.subject?.name ?? "No subject"} · ${test.slug}`,
        href: `/dashboard/tests/${test.slug}`,
      })),
      ...students.map((student) => ({
        id: student.id,
        type: "student" as const,
        title: `${student.firstName} ${student.lastName}`,
        subtitle: student.email,
        href: "/dashboard/students",
      })),
      ...classes.map((classList) => ({
        id: classList.id,
        type: "class" as const,
        title: classList.name,
        subtitle: classList.session || classList.level,
        href: "/dashboard/classes",
      })),
      ...subjects.map((subject) => ({
        id: subject.id,
        type: "subject" as const,
        title: subject.name,
        subtitle: subject.code,
        href: "/dashboard/subjects",
      })),
      ...materials.map((material) => ({
        id: material.id,
        type: "material" as const,
        title: material.name,
        subtitle: material.subject.name,
        href: "/dashboard/materials",
      })),
      ...certificates.map((certificate) => ({
        id: certificate.id,
        type: "certificate" as const,
        title: certificate.name,
        subtitle: certificate.issuedBy || "Certificate",
        href: "/dashboard/certificates",
      })),
      ...transactionMatches.map((transaction) => ({
        id: transaction.id,
        type: "transaction" as const,
        title: `${transaction.type === "cr" ? "Credit" : "Debit"} transaction`,
        subtitle: `${transaction.amount} · ${transaction.id}`,
        href: "/dashboard/transactions",
      })),
    ];

    return { results: results.slice(0, 24) };
  } catch (error) {
    console.error("[DASHBOARD_SEARCH_ERROR]", error);
    return { error: "Search failed", results: [] as DashboardSearchResult[] };
  }
}
