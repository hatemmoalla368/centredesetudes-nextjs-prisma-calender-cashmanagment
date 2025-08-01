-- AlterTable
ALTER TABLE "Schedule" ADD COLUMN     "invoiceId" INTEGER,
ADD COLUMN     "invoiced" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;
