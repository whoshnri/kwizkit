import { PrismaClient } from '@prisma/client';
import formidable from 'formidable';
import fs from 'fs/promises';
import path from 'path';
import Papa from 'papaparse';
import { readFile, utils } from 'xlsx';
import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'stream';

const prisma = new PrismaClient();

// Ensure uploads directory exists
async function ensureUploadsDir() {
  const uploadsDir = path.join(process.cwd(), 'uploads');
  await fs.mkdir(uploadsDir, { recursive: true });
  return uploadsDir;
}

// Clean up uploaded file and temp dir
async function cleanup(filePath: string, uploadsDir: string) {
  try {
    await fs.unlink(filePath);
    const files = await fs.readdir(uploadsDir);
    if (files.length === 0) await fs.rmdir(uploadsDir);
  } catch {}
}

// Validate and build StudentTest record
function validateStudentTest(record: any, testId: string) {
  if (!record.studentMatricNumber || !record.studentSurname) {
    throw new Error(`Missing required fields in record: ${JSON.stringify(record)}`);
  }
  if (record.score && isNaN(parseInt(record.score))) {
    throw new Error(`Invalid score in record: ${record.score}`);
  }
  const validated = {
    studentMatricNumber: String(record.studentMatricNumber),
    studentSurname: String(record.studentSurname),
    testId: testId,
    score: record.score ? parseInt(record.score) : null,
    assignedAt: new Date(),
  };
    return validated

}

// Parse uploaded file
async function parseFile(filePath: string, extension: string): Promise<any[]> {
  try {
    switch (extension.toLowerCase()) {
      case '.csv': {
        const csvContent = await fs.readFile(filePath, 'utf8');
        return new Promise((resolve, reject) => {
          Papa.parse(csvContent, {
            header: true,
            skipEmptyLines: true,
            complete: (result) => resolve(result.data),
            error: (error) => reject(error),
          });
        });
      }
      case '.json': {
        const jsonContent = await fs.readFile(filePath, 'utf8');
        const data = JSON.parse(jsonContent);
        return Array.isArray(data) ? data : [data];
      }
      case '.xlsx':
      case '.xls': {
        const workbook = readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        return utils.sheet_to_json(sheet);
      }
      default:
        throw new Error(`Unsupported file extension: ${extension}`);
    }
  } catch (error: any) {
    throw new Error(`Error parsing file: ${error.message}`);
  }
}


async function storeInDatabase(data: any[], testId: string) {
  // Validate records
  const validatedRecords = data.map((record) =>
    validateStudentTest(record, testId)
  );

  // Ensure test exists
  const test = await prisma.test.findUnique({ where: { id: testId } });
  if (!test) {
    throw new Error(`Test with ID '${testId}' does not exist`);
  }

  // Insert into database
  try {
    const result = await prisma.studentTest.createMany({
      data: validatedRecords,
    });
    console.log(`✓ Inserted ${result.count} student records to test "${test.name}"`);
    return { success: true, message: `Inserted ${result.count} records` };
  } catch (error: any) {
    console.error("✗ Failed to insert records:", error.message);
    throw error;
  }
}


// Convert Web ReadableStream to Node.js Readable
function toNodeReadable(stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader();
  return new Readable({
    async read() {
      const { done, value } = await reader.read();
      if (done) return this.push(null);
      this.push(Buffer.from(value));
    }
  });
}

// Reconstruct Node.js-compatible IncomingMessage
function toIncomingMessage(req: NextRequest): any {
  const readable = toNodeReadable(req.body!);
  return Object.assign(readable, {
    headers: Object.fromEntries(req.headers.entries()),
    method: req.method,
    url: ''
  });
}

// Main upload handler
export async function POST(req: NextRequest) {
  const uploadsDir = await ensureUploadsDir();
  console.log(">>> Virtual Folder Created");

  const form = formidable({ uploadDir: uploadsDir, keepExtensions: true });
  let filePath = "";

  try {
    const incomingReq = toIncomingMessage(req);
    console.log(">>> incoming request >> " + incomingReq);

    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(incomingReq, (err, fields, files) => {
        if (err) {
          console.log(">>> encountered an error");
          reject(err);
        } else {
          resolve({ fields, files });
        }
      });
    });

    console.log(">>> form parse completed");

    const testId = fields.testId?.[0] || fields.testId;
    if (!testId) {
      return NextResponse.json({ error: "Missing testId" }, { status: 400 });
    }

    const fileField = (files as any)?.file;
    const file = Array.isArray(fileField) ? fileField[0] : fileField;

    if (!file) {
      console.log(">>> No file");
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    console.log(">>> File exists at ln 158");

    filePath = file.filepath;
    console.log(">>> Virtul filepath of upload" + filePath);

    const extension = path.extname(file.originalFilename);
    console.log(">>> Virtul extension of upload" + extension);

    const parsedData = await parseFile(filePath, extension);
    console.log(">>> data parse to json successful");

    const result = await storeInDatabase(parsedData, testId);
    console.log(">>> stored successfully");

    await cleanup(filePath, uploadsDir);
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    if (filePath) await cleanup(filePath, uploadsDir);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
