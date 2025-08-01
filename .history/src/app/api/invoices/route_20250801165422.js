import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '@/lib/auth';

const prisma = new PrismaClient();

export const GET = authMiddleware(async (request) => {
  const { searchParams } = new URL(request.url);
  const latest = searchParams.get('latest');

  try {
    if (latest) {
      const latestReceipt = await prisma.receipt.findFirst({
        orderBy: { receiptNumber: 'desc' },
      });
      return NextResponse.json({ latestReceipt });
    }

    const receipts = await prisma.receipt.findMany({
      orderBy: { createdAt: 'desc' },
      include: { transaction: true },
    });
    return NextResponse.json(receipts);
  } catch (error) {
    console.error('Error fetching receipts:', error);
    return NextResponse.json({ error: 'Failed to fetch receipts' }, { status: 500 });
  }
});

export const POST = authMiddleware(async (request) => {
  try {
    const data = await request.json();
    const receipt = await prisma.receipt.create({
      data: {
        receiptNumber: data.receiptNumber,
        payerName: data.payerName,
        payerAddress: data.payerAddress,
        paymentDate: new Date(data.paymentDate),
        amount: parseFloat(data.amount),
        amountInWords: data.amountInWords,
        paymentDescription: data.paymentDescription,
        paymentMethod: data.paymentMethod,
        place: data.place,
        transactionId: parseInt(data.transactionId),
        companyName: data.companyName || 'EduSpace Coworking',
        companyLogo: data.companyLogo || '/logo.png',
        companyAddress: data.companyAddress || '24 Rue de l\'Éducation, Tunis 1002',
        companyPhone: data.companyPhone || '+216 70 123 456',
        companyEmail: data.companyEmail || 'contact@eduspace.tn',
        matriculeFiscale: data.matriculeFiscale || 'MF12345678',
      },
    });

    // Update the transaction to mark it as having a receipt
    await prisma.transaction.update({
      where: { id: parseInt(data.transactionId) },
      data: { hasReceipt: true },
    });

    return NextResponse.json(receipt, { status: 201 });
  } catch (error) {
    console.error('Error creating receipt:', error);
    return NextResponse.json({ error: 'Failed to create receipt' }, { status: 500 });
  }
});

export const DELETE = authMiddleware(async (request, { params }) => {
  try {
    const id = parseInt(request.nextUrl.pathname.split('/').pop());
    const receipt = await prisma.receipt.findUnique({ where: { id } });
    if (!receipt) {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
    }

    // Update the associated transaction to mark it as not having a receipt
    await prisma.transaction.update({
      where: { id: receipt.transactionId },
      data: { hasReceipt: false },
    });

    await prisma.receipt.delete({ where: { id } });
    return NextResponse.json({ message: 'Receipt deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting receipt:', error);
    return NextResponse.json({ error: 'Failed to delete receipt' }, { status: 500 });
  }
});