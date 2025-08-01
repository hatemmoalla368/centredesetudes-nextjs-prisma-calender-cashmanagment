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
    const transaction = await prisma.transaction.findUnique({
      where: { id: parseInt(data.transactionId) },
    });
    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }
    if (transaction.hasReceipt) {
      return NextResponse.json({ error: 'Transaction already has a receipt' }, { status: 400 });
    }

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

export const DELETE = authMiddleware(async (request) => {
  try {
    const id = parseInt(request.nextUrl.pathname.split('/').pop());
    const receipt = await prisma.receipt.findUnique({ where: { id } });
    if (!receipt) {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
    }

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