"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import prisma from "@/lib/prisma";
import { Gender, Level, MaterialType } from "@/lib/generated/prisma/client";

export type StudentInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  gender: Gender;
  image?: string | null;
  level: Level;
  studentId?: string | null;
  dateOfBirth?: string | null;
  address?: string | null;
  guardianName?: string | null;
  guardianPhone?: string | null;
  isActive: boolean;
};

export type ClassListInput = {
  name: string;
  description?: string | null;
  level: Level;
  session?: string | null;
  isActive: boolean;
};

export type SubjectInput = {
  name: string;
  code: string;
  description?: string | null;
  level: Level;
  unit: number;
  classListId: string;
};

export type CertificateInput = {
  name: string;
  description?: string | null;
  issuedBy?: string | null;
  issuedAt?: string | null;
};

export type MaterialInput = {
  name: string;
  level: Level;
  type: MaterialType;
  subjectId: string;
};

function maybeDate(value?: string | null) {
  return value ? new Date(value) : null;
}

async function ownsStudent(userId: string, studentId: string) {
  return prisma.student.findFirst({ where: { id: studentId, createdById: userId } });
}

async function ownsClass(userId: string, classListId: string) {
  return prisma.classList.findFirst({ where: { id: classListId, createdById: userId } });
}

async function ownsSubject(userId: string, subjectId: string) {
  return prisma.subject.findFirst({ where: { id: subjectId, createdById: userId } });
}

async function ownsCertificate(userId: string, certificationId: string) {
  return prisma.certification.findFirst({ where: { id: certificationId, createdById: userId } });
}

export async function fetchStudents(userId: string) {
  try {
    const students = await prisma.student.findMany({
      where: { createdById: userId },
      orderBy: { createdAt: "desc" },
      include: {
        classLists: { include: { classList: true } },
        subjectEnrollments: { include: { subject: true } },
        certifications: { include: { certification: true } },
        testScores: { include: { test: { select: { name: true, slug: true } } } },
        liveAttempts: { include: { test: { select: { name: true, slug: true } } } },
        attendanceRecords: { include: { session: true } },
      },
    });

    return { students };
  } catch (error) {
    console.error("[FETCH_STUDENTS_ERROR]", error);
    return { error: "Failed to load students" };
  }
}

export async function saveStudent(userId: string, input: StudentInput, id?: string) {
  try {
    const data = {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone || null,
      gender: input.gender,
      image: input.image || null,
      level: input.level,
      studentId: input.studentId || null,
      dateOfBirth: maybeDate(input.dateOfBirth),
      address: input.address || null,
      guardianName: input.guardianName || null,
      guardianPhone: input.guardianPhone || null,
      isActive: input.isActive,
    };

    if (id && !(await ownsStudent(userId, id))) return { error: "Student not found" };

    const student = id
      ? await prisma.student.update({ where: { id }, data })
      : await prisma.student.create({
          data: { ...data, createdById: userId },
        });

    return { student, message: "Student saved" };
  } catch (error) {
    console.error("[SAVE_STUDENT_ERROR]", error);
    return { error: "Failed to save student" };
  }
}

export async function deleteStudent(userId: string, id: string) {
  try {
    const student = await ownsStudent(userId, id);
    if (!student) return { error: "Student not found" };
    await prisma.student.delete({ where: { id } });
    return { message: "Student deleted" };
  } catch (error) {
    console.error("[DELETE_STUDENT_ERROR]", error);
    return { error: "Failed to delete student" };
  }
}

export async function fetchClassLists(userId: string) {
  try {
    const [classLists, students] = await Promise.all([
      prisma.classList.findMany({
        where: { createdById: userId },
        orderBy: { createdAt: "desc" },
        include: {
          students: { include: { student: true } },
          subjects: true,
          attendanceSessions: true,
        },
      }),
      prisma.student.findMany({ where: { createdById: userId }, orderBy: { lastName: "asc" } }),
    ]);
    return { classLists, students };
  } catch (error) {
    console.error("[FETCH_CLASS_LISTS_ERROR]", error);
    return { error: "Failed to load classes" };
  }
}

export async function saveClassList(userId: string, input: ClassListInput, id?: string) {
  try {
    const data = {
      name: input.name,
      description: input.description || null,
      level: input.level,
      session: input.session || null,
      isActive: input.isActive,
    };
    if (id && !(await ownsClass(userId, id))) return { error: "Class not found" };

    const classList = id
      ? await prisma.classList.update({ where: { id }, data })
      : await prisma.classList.create({ data: { ...data, createdById: userId } });

    return { classList, message: "Class saved" };
  } catch (error) {
    console.error("[SAVE_CLASS_LIST_ERROR]", error);
    return { error: "Failed to save class" };
  }
}

export async function deleteClassList(userId: string, id: string) {
  try {
    const classList = await ownsClass(userId, id);
    if (!classList) return { error: "Class not found" };
    await prisma.classList.delete({ where: { id } });
    return { message: "Class deleted" };
  } catch (error) {
    console.error("[DELETE_CLASS_LIST_ERROR]", error);
    return { error: "Failed to delete class" };
  }
}

export async function addStudentToClass(userId: string, classListId: string, studentId: string) {
  try {
    const [classList, student] = await Promise.all([
      ownsClass(userId, classListId),
      ownsStudent(userId, studentId),
    ]);
    if (!classList || !student) return { error: "Class or student not found" };

    await prisma.classListStudent.upsert({
      where: { classListId_studentId: { classListId, studentId } },
      update: {},
      create: { classListId, studentId },
    });
    return { message: "Student added to class" };
  } catch (error) {
    console.error("[ADD_STUDENT_TO_CLASS_ERROR]", error);
    return { error: "Failed to add student" };
  }
}

export async function removeStudentFromClass(userId: string, classListId: string, studentId: string) {
  try {
    const classList = await ownsClass(userId, classListId);
    if (!classList) return { error: "Class not found" };
    await prisma.classListStudent.delete({
      where: { classListId_studentId: { classListId, studentId } },
    });
    return { message: "Student removed from class" };
  } catch (error) {
    console.error("[REMOVE_STUDENT_FROM_CLASS_ERROR]", error);
    return { error: "Failed to remove student" };
  }
}

export async function fetchSubjects(userId: string) {
  try {
    const [subjects, classLists, students] = await Promise.all([
      prisma.subject.findMany({
        where: { createdById: userId },
        orderBy: { createdAt: "desc" },
        include: {
          classList: true,
          enrollments: { include: { student: true } },
          materials: true,
          tests: true,
        },
      }),
      prisma.classList.findMany({ where: { createdById: userId }, orderBy: { name: "asc" } }),
      prisma.student.findMany({ where: { createdById: userId }, orderBy: { lastName: "asc" } }),
    ]);
    return { subjects, classLists, students };
  } catch (error) {
    console.error("[FETCH_SUBJECTS_ERROR]", error);
    return { error: "Failed to load subjects" };
  }
}

export async function saveSubject(userId: string, input: SubjectInput, id?: string) {
  try {
    const classList = await ownsClass(userId, input.classListId);
    if (!classList) return { error: "Class not found" };

    const data = {
      name: input.name,
      code: input.code,
      description: input.description || null,
      level: input.level,
      unit: Math.max(1, Number(input.unit) || 1),
      classListId: input.classListId,
    };

    if (id && !(await ownsSubject(userId, id))) return { error: "Subject not found" };

    const subject = id
      ? await prisma.subject.update({ where: { id }, data })
      : await prisma.subject.create({ data: { ...data, createdById: userId } });

    return { subject, message: "Subject saved" };
  } catch (error) {
    console.error("[SAVE_SUBJECT_ERROR]", error);
    return { error: "Failed to save subject" };
  }
}

export async function deleteSubject(userId: string, id: string) {
  try {
    const subject = await ownsSubject(userId, id);
    if (!subject) return { error: "Subject not found" };
    await prisma.subject.delete({ where: { id } });
    return { message: "Subject deleted" };
  } catch (error) {
    console.error("[DELETE_SUBJECT_ERROR]", error);
    return { error: "Failed to delete subject" };
  }
}

export async function enrollStudentInSubject(userId: string, subjectId: string, studentId: string) {
  try {
    const [subject, student] = await Promise.all([
      ownsSubject(userId, subjectId),
      ownsStudent(userId, studentId),
    ]);
    if (!subject || !student) return { error: "Subject or student not found" };

    await prisma.studentSubject.upsert({
      where: { studentId_subjectId: { studentId, subjectId } },
      update: {},
      create: { studentId, subjectId },
    });
    return { message: "Student enrolled" };
  } catch (error) {
    console.error("[ENROLL_STUDENT_ERROR]", error);
    return { error: "Failed to enroll student" };
  }
}

export async function removeStudentFromSubject(userId: string, subjectId: string, studentId: string) {
  try {
    const subject = await ownsSubject(userId, subjectId);
    if (!subject) return { error: "Subject not found" };
    await prisma.studentSubject.delete({
      where: { studentId_subjectId: { studentId, subjectId } },
    });
    return { message: "Student removed" };
  } catch (error) {
    console.error("[REMOVE_STUDENT_SUBJECT_ERROR]", error);
    return { error: "Failed to remove student" };
  }
}

export async function fetchMaterials(userId: string) {
  try {
    const [materials, subjects] = await Promise.all([
      prisma.subjectMaterial.findMany({
        where: { subject: { createdById: userId } },
        orderBy: { createdAt: "desc" },
        include: { subject: true },
      }),
      prisma.subject.findMany({ where: { createdById: userId }, orderBy: { name: "asc" } }),
    ]);
    return { materials, subjects };
  } catch (error) {
    console.error("[FETCH_MATERIALS_ERROR]", error);
    return { error: "Failed to load materials" };
  }
}

export async function saveMaterial(userId: string, input: MaterialInput, file?: File | null, id?: string) {
  try {
    const subject = await ownsSubject(userId, input.subjectId);
    if (!subject) return { error: "Subject not found" };

    let files = "[]";
    if (file && file.size > 0) {
      const uploadDir = path.join(process.cwd(), "public", "uploads", "materials");
      await mkdir(uploadDir, { recursive: true });
      const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
      const uploadPath = path.join(uploadDir, safeName);
      const bytes = await file.arrayBuffer();
      await writeFile(uploadPath, Buffer.from(bytes));
      files = JSON.stringify([
        {
          name: file.name,
          url: `/uploads/materials/${safeName}`,
          size: file.size,
          mimeType: file.type || "application/octet-stream",
        },
      ]);
    } else if (id) {
      const existing = await prisma.subjectMaterial.findFirst({
        where: { id, subject: { createdById: userId } },
        select: { files: true },
      });
      files = String(existing?.files ?? "[]");
    }

    const data = {
      name: input.name,
      level: input.level,
      type: input.type,
      subjectId: input.subjectId,
      files,
    };

    if (id) {
      const existing = await prisma.subjectMaterial.findFirst({
        where: { id, subject: { createdById: userId } },
      });
      if (!existing) return { error: "Material not found" };
    }

    const material = id
      ? await prisma.subjectMaterial.update({ where: { id }, data })
      : await prisma.subjectMaterial.create({ data });

    return { material, message: "Material saved" };
  } catch (error) {
    console.error("[SAVE_MATERIAL_ERROR]", error);
    return { error: "Failed to save material" };
  }
}

export async function deleteMaterial(userId: string, id: string) {
  try {
    const material = await prisma.subjectMaterial.findFirst({
      where: { id, subject: { createdById: userId } },
    });
    if (!material) return { error: "Material not found" };
    await prisma.subjectMaterial.delete({ where: { id } });
    return { message: "Material deleted" };
  } catch (error) {
    console.error("[DELETE_MATERIAL_ERROR]", error);
    return { error: "Failed to delete material" };
  }
}

export async function fetchCertificates(userId: string) {
  try {
    const [certificates, students] = await Promise.all([
      prisma.certification.findMany({
        where: { createdById: userId },
        orderBy: { createdAt: "desc" },
        include: { students: { include: { student: true } } },
      }),
      prisma.student.findMany({ where: { createdById: userId }, orderBy: { lastName: "asc" } }),
    ]);
    return { certificates, students };
  } catch (error) {
    console.error("[FETCH_CERTIFICATES_ERROR]", error);
    return { error: "Failed to load certificates" };
  }
}

export async function saveCertificate(userId: string, input: CertificateInput, id?: string) {
  try {
    const data = {
      name: input.name,
      description: input.description || null,
      issuedBy: input.issuedBy || null,
      issuedAt: maybeDate(input.issuedAt) ?? new Date(),
    };
    if (id && !(await ownsCertificate(userId, id))) return { error: "Certificate not found" };

    const certificate = id
      ? await prisma.certification.update({ where: { id }, data })
      : await prisma.certification.create({ data: { ...data, createdById: userId } });
    return { certificate, message: "Certificate saved" };
  } catch (error) {
    console.error("[SAVE_CERTIFICATE_ERROR]", error);
    return { error: "Failed to save certificate" };
  }
}

export async function deleteCertificate(userId: string, id: string) {
  try {
    const certificate = await ownsCertificate(userId, id);
    if (!certificate) return { error: "Certificate not found" };
    await prisma.certification.delete({ where: { id } });
    return { message: "Certificate deleted" };
  } catch (error) {
    console.error("[DELETE_CERTIFICATE_ERROR]", error);
    return { error: "Failed to delete certificate" };
  }
}

export async function assignCertificate(userId: string, certificationId: string, studentId: string, certificateRef?: string) {
  try {
    const [certificate, student] = await Promise.all([
      ownsCertificate(userId, certificationId),
      ownsStudent(userId, studentId),
    ]);
    if (!certificate || !student) return { error: "Certificate or student not found" };

    await prisma.studentCertification.upsert({
      where: { studentId_certificationId: { studentId, certificationId } },
      update: { certificateRef: certificateRef || null },
      create: { studentId, certificationId, certificateRef: certificateRef || null },
    });
    return { message: "Certificate assigned" };
  } catch (error) {
    console.error("[ASSIGN_CERTIFICATE_ERROR]", error);
    return { error: "Failed to assign certificate" };
  }
}

export async function removeCertificateAssignment(userId: string, certificationId: string, studentId: string) {
  try {
    const certificate = await ownsCertificate(userId, certificationId);
    if (!certificate) return { error: "Certificate not found" };
    await prisma.studentCertification.delete({
      where: { studentId_certificationId: { studentId, certificationId } },
    });
    return { message: "Certificate assignment removed" };
  } catch (error) {
    console.error("[REMOVE_CERTIFICATE_ERROR]", error);
    return { error: "Failed to remove certificate" };
  }
}
