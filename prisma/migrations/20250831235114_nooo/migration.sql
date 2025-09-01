-- CreateTable
CREATE TABLE "_TableSchemaToTest" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_TableSchemaToTest_A_fkey" FOREIGN KEY ("A") REFERENCES "table_schemas" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_TableSchemaToTest_B_fkey" FOREIGN KEY ("B") REFERENCES "Test" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_TableSchemaToTest_AB_unique" ON "_TableSchemaToTest"("A", "B");

-- CreateIndex
CREATE INDEX "_TableSchemaToTest_B_index" ON "_TableSchemaToTest"("B");
