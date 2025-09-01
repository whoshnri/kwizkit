// @/lib/prisma-service.ts (or your file path)
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// No changes needed here, logic is sound for a single creation.
export async function createTable(
  name: string,
  managerId: string,
  columns: any[]
) {
  return prisma.tableSchema.create({
    data: {
      name,
      columns,
      managers: {
        connect: { id: managerId },
      },
    },
  });
}

/**
 * REFACTORED: Creates multiple students and adds them to a table within a single transaction.
 * This ensures that if adding a student to a table fails, the student creation is rolled back,
 * preventing orphaned student records.
 */
export async function createManyStudents(
  tableId: string,
  studentsData: Array<{
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    additionalData?: any;
  }>
) {
  return prisma.$transaction(async (tx) => {
    const results = [];
    for (const studentData of studentsData) {
      // 1. Create the student
      const student = await tx.student.create({
        data: {
          firstName: studentData.firstName,
          lastName: studentData.lastName,
          email: studentData.email,
          password: studentData.password, // Remember to hash in production
        },
      });

      // 2. Add student to the table
      await tx.tableRow.create({
        data: {
          tableId,
          studentId: student.id,
          data: studentData.additionalData || {},
        },
      });

      results.push(student);
    }
    return results;
  });
}

/**
 * REFACTORED: Deletes a table and all its related students atomically.
 * Assumes `onDelete: Cascade` is set in the schema.prisma for TableRow.
 * This makes the logic much simpler and safer.
 */
export async function deleteTableSchema(tableId: string) {
  // Thanks to `onDelete: Cascade`, we only need to perform one action.
  // Deleting the TableSchema will automatically trigger the deletion of:
  // 1. All associated TableRow records.
  // 2. All associated Test records (if you add onDelete: Cascade there too).
  // We still need to manually delete the students who are now orphaned.

  return prisma.$transaction(async (tx) => {
    // 1. Find all students that belong ONLY to this table.
    const studentIdsToDelete = await tx.student.findMany({
      where: {
        tableRows: {
          every: {
            tableId: tableId,
          },
        },
      },
      select: {
        id: true,
      },
    });
    const ids = studentIdsToDelete.map((s) => s.id);

    // 2. Delete the table itself. Cascading deletes will remove TableRows.
    const deletedTable = await tx.tableSchema.delete({
      where: { id: tableId },
    });

    // 3. Delete the orphaned students.
    if (ids.length > 0) {
      await tx.student.deleteMany({
        where: { id: { in: ids } },
      });
    }

    return { deletedStudents: ids.length, tableId: deletedTable.id };
  });
}

/**
 * REFACTORED: The main update function, now wrapped in a transaction.
 * This is the most critical change to prevent inconsistent data states.
 * It assumes `onDelete: Cascade` is active on the `TableRow` model.
 */
export async function updateTable(
  tableId: string,
  updates: {
    name?: string;
    columns?: any[];
    addStudents?: Array<{
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      password?: string; // Only for new students
      additionalData?: any;
    }>;
    removeStudentIds?: string[];
  }
) {
  await prisma.$transaction(async (tx) => {
    // 1. Update table name and columns if provided
    if (updates.name || updates.columns) {
      await tx.tableSchema.update({
        where: { id: tableId },
        data: {
          name: updates.name,
          columns: updates.columns,
        },
      });
    }

    if (updates.removeStudentIds && updates.removeStudentIds.length > 0) {
      await tx.student.deleteMany({
        where: {
          id: { in: updates.removeStudentIds },
        },
      });
    }

    // 3. Add or Update students
    if (updates.addStudents?.length) {
      for (const studentData of updates.addStudents) {
        let student;

        if (studentData.id) {
          // Existing student → use upsert
          student = await tx.student.upsert({
            where: { id: studentData.id },
            update: {
              firstName: studentData.firstName,
              lastName: studentData.lastName,
            },
            create: {
              firstName: studentData.firstName,
              lastName: studentData.lastName,
              email: studentData.email,
              password: studentData.password || "temporary-password",
            },
          });
        } else {
          // New student → create
          student = await tx.student.create({
            data: {
              firstName: studentData.firstName,
              lastName: studentData.lastName,
              email: studentData.email,
              password: studentData.password || "temporary-password",
            },
          });
        }

        // Upsert the row in the join table
        await tx.tableRow.upsert({
          where: {
            tableId_studentId: { tableId, studentId: student.id },
          },
          update: { data: studentData.additionalData || {} },
          create: {
            tableId,
            studentId: student.id,
            data: studentData.additionalData || {},
          },
        });
      }
    }
  });

  // After the transaction is successful, return the fresh table data.
  return getTableData(tableId);
}

// --- NO CHANGES NEEDED FOR THE FOLLOWING READ-ONLY FUNCTIONS ---

export async function loginStudent(
  email: string,
  password: string,
  tableId: string
) {
  const student = await prisma.student.findUnique({ where: { email } });
  if (!student || student.password !== password) {
    // Compare hashed passwords in production
    throw new Error("Invalid credentials");
  }
  const tableRow = await prisma.tableRow.findUnique({
    where: { tableId_studentId: { tableId, studentId: student.id } },
    include: { table: { include: { test: true } } },
  });
  if (!tableRow) throw new Error("Student not found in this table/test");
  return {
    student,
    tableData: tableRow.data,
    tests: tableRow.table.test,
  };
}

export async function addManagerToTable(tableId: string, managerId: string) {
  // This is a single operation, so transaction isn't strictly necessary but is good practice.
  return prisma.tableSchema.update({
    where: { id: tableId },
    data: { managers: { connect: { id: managerId } } },
    include: { managers: true },
  });
}

export async function getTablesByManager(managerId: string) {
  const user = await prisma.user.findUnique({
    where: { id: managerId },
    select: {
      managedTables: {
        include: {
          _count: { select: { rows: true } },
          test: { select: { id: true, name: true, slug: true } },
        },
      },
    },
  });
  return user?.managedTables;
}

export async function getTableData(tableId: string) {
  const table = await prisma.tableSchema.findUnique({
    where: { id: tableId },
    include: {
      rows: {
        include: {
          student: true, // Fetch the full student object
        },
      },
      managers: true,
      test: true,
    },
  });

  if (!table) return null;

  // A more flexible and robust data transformation
  return {
    ...table,
    rows: table.rows.map((row) => ({
      ...row,
      ...row.student,
      ...(row.data as object),
    })),
  };
}
