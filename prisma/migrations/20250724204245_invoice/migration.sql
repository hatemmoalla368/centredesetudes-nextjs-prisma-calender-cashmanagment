-- CreateTable
CREATE TABLE "Invoice" (
    "id" SERIAL NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientAddress" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "taxRate" DOUBLE PRECISION NOT NULL,
    "items" JSONB NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "taxAmount" DOUBLE PRECISION NOT NULL,
    "grandTotal" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyName" TEXT NOT NULL DEFAULT 'BETA SPACE',
    "companyLogo" TEXT NOT NULL DEFAULT '/logo.png',
    "companyAddress" TEXT NOT NULL DEFAULT 'Rte manzel chaker klm5, markez moalla, sfax',
    "companyPhone" TEXT NOT NULL DEFAULT '+216 24 021 594',
    "companyEmail" TEXT NOT NULL DEFAULT 'hatemmoalla368@gmail.com',
    "matriculeFiscale" TEXT NOT NULL DEFAULT 'MF12345678',

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");
