-- CreateTable
CREATE TABLE "AccessibilityIssue" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "page" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "element" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'not-fixed',
    "severity" TEXT NOT NULL,
    "fix" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccessibilityIssue_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AccessibilityIssue" ADD CONSTRAINT "AccessibilityIssue_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
