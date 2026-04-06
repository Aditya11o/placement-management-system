-- AlterTable
ALTER TABLE "StudentProfile" ADD COLUMN     "academicVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verificationAt" TIMESTAMP(3);
