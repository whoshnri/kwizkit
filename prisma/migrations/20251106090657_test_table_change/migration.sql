-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Test" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "subject" TEXT NOT NULL,
    "totalMarks" INTEGER,
    "numberOfQuestions" INTEGER,
    "difficulty" TEXT NOT NULL DEFAULT 'easy',
    "slug" TEXT NOT NULL,
    "settings" JSONB NOT NULL,
    "visibility" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Test_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Test" ("createdAt", "createdById", "description", "difficulty", "id", "name", "numberOfQuestions", "settings", "slug", "subject", "totalMarks", "updatedAt", "visibility") SELECT "createdAt", "createdById", "description", "difficulty", "id", "name", "numberOfQuestions", "settings", "slug", "subject", "totalMarks", "updatedAt", "visibility" FROM "Test";
DROP TABLE "Test";
ALTER TABLE "new_Test" RENAME TO "Test";
CREATE UNIQUE INDEX "Test_slug_key" ON "Test"("slug");
CREATE INDEX "Test_createdById_idx" ON "Test"("createdById");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
