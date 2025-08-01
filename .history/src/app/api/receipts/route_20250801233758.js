// src/app/api/receipts/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

const prisma = new PrismaClient();

// Define schema for validation
const receiptSchema = z.object({
  receiptNumber: z.string().min(1, 'Receipt number is required'),
  payerName: z.string().min(1, 'Payer name is required'),
  payerAddress: z.string().min(1, 'Payer address is required'),
  paymentDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid payment date',
  }),
  amount: z.number().positive('Amount must be a positive number'),
  amountInWords: z.string().min(1, 'Amount in words is required'),
  paymentDescription: z.string().min(1, 'Payment description is required'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  place: z.string().min(1, 'Place is required'),
  transactionId: z.number().optional(),
  companyName: z.string().optional(),
  companyLogo: z.string().optional(),
  companyAddress: z.string().optional(),
  companyPhone: z.string().optional(),
  companyEmail: z.string().optional(),
  matriculeFiscale: z.string().optional(),
});

export const GET = async (request) => {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
};

export const POST = async (request) => {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const parsedData = receiptSchema.safeParse(data);

    if (!parsedData.success) {
      return NextResponse.json({ error: parsedData.error.errors }, { status: 400 });
    }

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
    } = parsedData.data;

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
    return NextResponse.json({ error: 'Failed to create receipt', details: error.message }, { status: 500 });
  }
};

export const DELETE = async (request, { params }) => {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = parseInt(params.id);

    const receipt = await prisma.receipt.findUnique({
      where: { id },
    });

    if (!receipt) {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
    }

    if (receipt.transactionId) {
      await prisma.transaction.update({
        where: { id: receipt.transactionId },
        data: { hasReceipt: false },
      });
    }

    await prisma.receipt.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Receipt deleted' });
  } catch (error) {
    console.error('Error deleting receipt:', error);
    return NextResponse.json({ error: 'Failed to delete receipt' }, { status: 500 });
  }
};