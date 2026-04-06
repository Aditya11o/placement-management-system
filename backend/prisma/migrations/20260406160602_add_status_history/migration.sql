/*
  Warnings:

  - You are about to drop the column `resumeUrl` on the `Application` table. All the data in the column will be lost.
  - Added the required column `resume` to the `Application` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Application" DROP COLUMN "resumeUrl",
ADD COLUMN     "resume" TEXT NOT NULL,
ADD COLUMN     "resumeId" TEXT,
ADD COLUMN     "statusHistory" JSONB;
