/*
  Warnings:

  - A unique constraint covering the columns `[transactionId]` on the table `Receipt` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `transactionId` to the `Receipt` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Receipt" ADD COLUMN     "transactionId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "hasReceipt" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Receipt_transactionId_key" ON "Receipt"("transactionId");

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
