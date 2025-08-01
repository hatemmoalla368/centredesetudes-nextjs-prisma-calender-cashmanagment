import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '@/lib/auth';

const prisma = new PrismaClient();

export const GET = authMiddleware (async(request, { params })=> {
  try {
    const receipt = await prisma.receipt.findUnique({
      where: { id: parseInt(params.id) },
    });
    if (!receipt) {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
    }
    return NextResponse.json(receipt);
  } catch (error) {
    console.error('Error fetching receipt:', error);
    return NextResponse.json({ error: 'Failed to fetch receipt' }, { status: 500 });
  }
})

export const PUT = authMiddleware (async(request, { params }) => {
  try {
    const data = await request.json();
    const receipt = await prisma.receipt.update({
      where: { id: parseInt(params.id) },
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
    console.error('Error updating receipt:', error);
    return NextResponse.json({ error: 'Failed to update receipt' }, { status: 500 });
  }
})

export const DELETE = authMiddleware (async(request, { params })=> {
  try {
    const id = parseInt(params.id);
    
    const updatedrecu = await prisma.receipt.updateMany({
      where: { invoiceId: id },
      data: { invoiced: false, invoiceId: null },
    });
    await prisma.receipt.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Receipt deleted' });
  } catch (error) {
    console.error('Error deleting receipt:', error);
    return NextResponse.json({ error: 'Failed to delete receipt' }, { status: 500 });
  }
})