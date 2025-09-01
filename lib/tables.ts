import { JsonObject } from "@prisma/client/runtime/library";

export type ColumnType = "text" | "number" | "boolean"; // extend if needed

export interface Column extends JsonObject {
  id: string;
  name: string;
  type: ColumnType;
}

export interface Row extends JsonObject {
  id: string;
  data: Record<string, string | number | boolean>; 
  // key = column.id
}

export interface TableSchema {
  id: string;
  name: string;
  columns: Column[];
  rows: Row[];
  createdAt: Date;
  updatedAt: Date;
}
export type TableData = TableSchema[];

// Function to convert TableSchema to Prisma-compatible format

export interface Student {
  id: string;
  email: string;
  passwordHash: string; // Never store plain passwords!
  firstName: string;
  lastName: string;
  studentNumber: string; // Unique identifier
  enrollmentDate: Date;
  status: 'active' | 'inactive' | 'graduated';
  createdAt: Date;
  updatedAt: Date;
}