import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '@/lib/auth';

const prisma = new PrismaClient();



export const GET = authMiddleware(async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const latest = searchParams.get('latest');

    if (latest) {
      const latestReceipt = await prisma.receipt.findFirst({
        orderBy: { receiptNumber: 'desc' },
      });
      return NextResponse.json({ latestReceipt });
    }

    const receipts = await prisma.receipt.findMany({
      orderBy: { createdAt: 'desc' },
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
    const {
      receiptNumber,
      payerName,
      payerAddress,
      paymentDate,
      amount,
      amountInWords,
      paymentDescription,
      paymentMethod,
      place,
      transactionId,
      companyName,
      companyLogo,
      companyAddress,
      companyPhone,
      companyEmail,
      matriculeFiscale,
    } = data;

    if (!receiptNumber || !payerName || !payerAddress || !paymentDate || !amount || !amountInWords || !paymentDescription || !paymentMethod || !place) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate transactionId if provided
    if (transactionId) {
      const transaction = await prisma.transaction.findUnique({
        where: { id: parseInt(transactionId) },
      });

      if (!transaction) {
        return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
      }

      if (transaction.hasReceipt) {
        return NextResponse.json({ error: 'Transaction already has a receipt' }, { status: 400 });
      }
    }

    const existingReceipt = await prisma.receipt.findUnique({
      where: { receiptNumber },
    });

    if (existingReceipt) {
      return NextResponse.json({ error: 'Receipt number already exists' }, { status: 400 });
    }

    const receipt = await prisma.receipt.create({
  data: {
    receiptNumber,
    payerName,
    payerAddress,
    paymentDate: new Date(paymentDate),
    amount: parseFloat(amount),
    amountInWords,
    paymentDescription,
    paymentMethod,
    place,
    transactionId: transactionId ? parseInt(transactionId) : null,
    companyName: companyName || 'EduSpace Coworking',
    companyLogo: companyLogo || '/logo.png',
    companyAddress: companyAddress || '24 Rue de l\'Éducation, Tunis 1002',
    companyPhone: companyPhone || '+216 70 123 456',
    companyEmail: companyEmail || 'contact@eduspace.tn',
    matriculeFiscale: matriculeFiscale || 'MF12345678',
  },
});

    if (transactionId) {
      await prisma.transaction.update({
        where: { id: parseInt(transactionId) },
        data: { hasReceipt: true },
      });
    }

    return NextResponse.json(receipt, { status: 201 });
  } catch (error) {
    console.error('Error creating receipt:', error);
    return NextResponse.json({ error: 'Failed to create receipt' }, { status: 500 });
  }
});

export const DELETE = authMiddleware(async (request, { params }) => {
  try {
    const id = parseInt(params.id);

    const receipt = await prisma.receipt.findUnique({
      where: { id },
    });

    if (!receipt) {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
    }

    await prisma.transaction.update({
      where: { id: receipt.transactionId },
      data: { hasReceipt: false },
    });

    await prisma.receipt.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Receipt deleted' });
  } catch (error) {
    console.error('Error deleting receipt:', error);
    return NextResponse.json({ error: 'Failed to delete receipt' }, { status: 500 });
  }
});