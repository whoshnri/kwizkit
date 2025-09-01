import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 1. CREATE MANY STUDENTS - Create students and add them to a table
export async function createManyStudents(
  tableId: string, 
  studentsData: Array<{
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    additionalData?: any; // Extra data for the table row
  }>
) {
  const results = [];
  
  for (const studentData of studentsData) {
    // Create the student
    const student = await prisma.student.create({
      data: {
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        email: studentData.email,
        password: studentData.password // Hash in production
      }
    });
    
    // Add student to the table
    await prisma.tableRow.create({
      data: {
        tableId,
        studentId: student.id,
        data: studentData.additionalData || {}
      }
    });
    
    results.push(student);
  }
  
  return results;
}

// 2. LOGIN STUDENT - Check if student exists in table and authenticate
export async function loginStudent(email: string, password: string, tableId: string) {
  // First, find the student
  const student = await prisma.student.findUnique({
    where: { email }
  });
  
  if (!student || student.password !== password) {
    throw new Error('Invalid credentials');
  }
  
  // Check if student exists in the specified table
  const tableRow = await prisma.tableRow.findUnique({
    where: {
      tableId_studentId: {
        tableId,
        studentId: student.id
      }
    },
    include: {
      table: {
        include: {
          test: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        }
      }
    }
  });
  
  if (!tableRow) {
    throw new Error('Student not found in this table/test');
  }
  
  return {
    student: {
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email
    },
    tableData: tableRow.data,
    tests: tableRow.table.test
  };
}

// 3. DELETE TABLE SCHEMA - Cascade delete table rows and students
export async function deleteTableSchema(tableId: string) {
  // Get all student IDs in this table
  const tableRows = await prisma.tableRow.findMany({
    where: { tableId },
    select: { studentId: true }
  });
  
  const studentIds = tableRows.map(row => row.studentId);
  
  // Delete in order: TableRows -> Students -> TableSchema
  await prisma.tableRow.deleteMany({
    where: { tableId }
  });
  
  // Delete students
  if (studentIds.length > 0) {
    await prisma.student.deleteMany({
      where: {
        id: { in: studentIds }
      }
    });
  }
  
  // Finally delete the table schema
  await prisma.tableSchema.delete({
    where: { id: tableId }
  });
  
  return { deletedStudents: studentIds.length, tableId };
}

// 4. CREATE TABLE - Just required fields
export async function createTable(name: string, columns: any[]) {
  return prisma.tableSchema.create({
    data: {
      name,
      columns
    }
  });
}

// 5. ADD MANAGER - Add manager to existing table
export async function addManagerToTable(tableId: string, managerId: string) {
  return prisma.tableSchema.update({
    where: { id: tableId },
    data: {
      managers: {
        connect: { id: managerId }
      }
    }
  });
}

// 6. GET TABLES BY MANAGER
export async function getTablesByManager(managerId: string) {
  return prisma.user.findUnique({
    where: { id: managerId },
    select: {
      managedTables: {
        include: {
          _count: { select: { rows: true } },
          test: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        }
      }
    }
  });
}

// 7. GET TABLE DATA - All students in a table with their data
export async function getTableData(tableId: string) {
  const table = await prisma.tableSchema.findUnique({
    where: { id: tableId },
    include: {
      rows: {
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      },
      managers: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      },
      test: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      }
    }
  });

  if (table) {
    return {
      id: table.id,
      name: table.name,
      columns: table.columns,
      managers: table.managers,
      tests: table.test,
      students: table.rows.map(row => ({
        id: row.student.id,
        firstName: row.student.firstName,
        lastName: row.student.lastName,
        email: row.student.email,
        ...row.data as any
      }))
    };
  }
  
  return null;
}

// 8. UPDATE TABLE - Handle deletions and additions of students
export async function updateTable(
  tableId: string, 
  updates: {
    name?: string;
    columns?: any[];
    addStudents?: Array<{
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      additionalData?: any;
    }>;
    removeStudentIds?: string[];
    updateStudentData?: Array<{
      studentId: string;
      data: any;
    }>;
  }
) {
  const operations = [];

  // Update table name and columns if provided
  if (updates.name || updates.columns) {
    operations.push(
      prisma.tableSchema.update({
        where: { id: tableId },
        data: {
          ...(updates.name && { name: updates.name }),
          ...(updates.columns && { columns: updates.columns })
        }
      })
    );
  }

  // Remove students (this will cascade delete table rows due to foreign key)
  if (updates.removeStudentIds && updates.removeStudentIds.length > 0) {
    operations.push(
      prisma.student.deleteMany({
        where: {
          id: { in: updates.removeStudentIds }
        }
      })
    );
  }

  // Add new students
  if (updates.addStudents && updates.addStudents.length > 0) {
    for (const studentData of updates.addStudents) {
      const student = await prisma.student.create({
        data: {
          firstName: studentData.firstName,
          lastName: studentData.lastName,
          email: studentData.email,
          password: studentData.password
        }
      });
      
      operations.push(
        prisma.tableRow.create({
          data: {
            tableId,
            studentId: student.id,
            data: studentData.additionalData || {}
          }
        })
      );
    }
  }

  // Update existing student data
  if (updates.updateStudentData && updates.updateStudentData.length > 0) {
    for (const update of updates.updateStudentData) {
      operations.push(
        prisma.tableRow.update({
          where: {
            tableId_studentId: {
              tableId,
              studentId: update.studentId
            }
          },
          data: {
            data: update.data
          }
        })
      );
    }
  }

  // Execute all operations
  await Promise.all(operations);
  
  // Return updated table data
  return getTableData(tableId);
}