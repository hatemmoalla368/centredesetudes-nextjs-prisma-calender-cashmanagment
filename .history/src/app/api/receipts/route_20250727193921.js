import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '@/lib/auth';

const prisma = new PrismaClient();

export const GET = authMiddleware = (async(request)=> {
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
    });
    return NextResponse.json(receipts);
  } catch (error) {
    console.error('Error fetching receipts:', error);
    return NextResponse.json({ error: 'Failed to fetch receipts' }, { status: 500 });
  }
})

export const POST = authMiddleware (async(request)=> {
  try {
    const data = await request.json();
    const receipt = await prisma.receipt.create({
      data: {
        payerName: data.payerName,
        payerAddress: data.payerAddress,
        receiptNumber: data.receiptNumber,
        paymentDate: new Date(data.paymentDate),
        amount: data.amount,
        amountInWords: data.amountInWords,
        paymentDescription: data.paymentDescription,
        paymentMethod: data.paymentMethod,
        place: data.place,
        companyName: data.companyName,
        companyLogo: data.companyLogo,
        companyAddress: data.companyAddress,
        companyPhone: data.companyPhone,
        companyEmail: data.companyEmail,
        matriculeFiscale: data.matriculeFiscale,
      },
    });
    return NextResponse.json(receipt);
  } catch (error) {
    console.error('Error creating receipt:', error);
    return NextResponse.json({ error: 'Failed to create receipt' }, { status: 500 });
  }
})