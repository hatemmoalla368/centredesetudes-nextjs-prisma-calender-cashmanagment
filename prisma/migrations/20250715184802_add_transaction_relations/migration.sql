/*
  Warnings:

  - You are about to drop the column `dueDate` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `relatedId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `relatedTo` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the `RevenueShareAgreement` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `status` on table `Transaction` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "RevenueShareAgreement" DROP CONSTRAINT "RevenueShareAgreement_studentId_fkey";

-- DropForeignKey
ALTER TABLE "RevenueShareAgreement" DROP CONSTRAINT "RevenueShareAgreement_teacherId_fkey";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "dueDate",
DROP COLUMN "relatedId",
DROP COLUMN "relatedTo",
ADD COLUMN     "studentId" INTEGER,
ADD COLUMN     "teacherId" INTEGER,
ALTER COLUMN "status" SET NOT NULL,
ALTER COLUMN "status" DROP DEFAULT;

-- DropTable
DROP TABLE "RevenueShareAgreement";

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;
