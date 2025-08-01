-- CreateTable
CREATE TABLE "Receipt" (
    "id" SERIAL NOT NULL,
    "payerName" TEXT NOT NULL,
    "payerAddress" TEXT NOT NULL,
    "receiptNumber" TEXT NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "amountInWords" TEXT NOT NULL,
    "paymentDescription" TEXT NOT NULL,
    "paymentMethod" JSONB NOT NULL,
    "place" TEXT NOT NULL,
    "companyName" TEXT NOT NULL DEFAULT 'EduSpace Coworking',
    "companyLogo" TEXT NOT NULL DEFAULT '/logo.png',
    "companyAddress" TEXT NOT NULL DEFAULT '24 Rue de l''Éducation, Tunis 1002',
    "companyPhone" TEXT NOT NULL DEFAULT '+216 70 123 456',
    "companyEmail" TEXT NOT NULL DEFAULT 'contact@eduspace.tn',
    "matriculeFiscale" TEXT NOT NULL DEFAULT 'MF12345678',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Receipt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Receipt_receiptNumber_key" ON "Receipt"("receiptNumber");
