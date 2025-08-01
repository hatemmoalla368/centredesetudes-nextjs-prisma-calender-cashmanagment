-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "dueDate" TIMESTAMP(3),
ADD COLUMN     "relatedId" INTEGER,
ADD COLUMN     "relatedTo" TEXT,
ADD COLUMN     "status" TEXT DEFAULT 'completed';

-- CreateTable
CREATE TABLE "RevenueShareAgreement" (
    "id" SERIAL NOT NULL,
    "teacherId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "centerShare" DOUBLE PRECISION NOT NULL,
    "teacherShare" DOUBLE PRECISION NOT NULL,
    "sessionsPerPayment" INTEGER NOT NULL,
    "completedSessions" INTEGER NOT NULL DEFAULT 0,
    "nextPaymentDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RevenueShareAgreement_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RevenueShareAgreement" ADD CONSTRAINT "RevenueShareAgreement_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevenueShareAgreement" ADD CONSTRAINT "RevenueShareAgreement_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
