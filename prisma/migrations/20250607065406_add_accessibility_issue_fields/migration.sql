-- AlterTable
ALTER TABLE "AccessibilityIssue" ADD COLUMN     "fixedAt" TIMESTAMP(3),
ALTER COLUMN "status" SET DEFAULT 'open';
