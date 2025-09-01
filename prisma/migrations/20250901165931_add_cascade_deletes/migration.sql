-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_table_rows" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "table_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "table_rows_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "table_schemas" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "table_rows_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_table_rows" ("created_at", "data", "id", "student_id", "table_id", "updated_at") SELECT "created_at", "data", "id", "student_id", "table_id", "updated_at" FROM "table_rows";
DROP TABLE "table_rows";
ALTER TABLE "new_table_rows" RENAME TO "table_rows";
CREATE UNIQUE INDEX "table_rows_table_id_student_id_key" ON "table_rows"("table_id", "student_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
