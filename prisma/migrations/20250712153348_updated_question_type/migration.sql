/*
  Warnings:

  - A unique constraint covering the columns `[qid]` on the table `Question` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Question_qid_key" ON "Question"("qid");
