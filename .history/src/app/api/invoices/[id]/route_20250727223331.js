import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '@/lib/auth';

const prisma = new PrismaClient();

export  const GET = authMiddleware(async(request, { params })=> {
  try {
    const id = parseInt(params.id);
    const invoice = await prisma.invoice.findUnique({
      where: { id },
    });
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }
    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 });
  }
})

export const PUT = authMiddleware (async(request, { params })=> {
  try {
    const id = parseInt(params.id);
    const data = await request.json();
    if (!data.clientName || !data.clientAddress || !data.invoiceNumber || !data.date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        clientName: data.clientName,
        clientAddress: data.clientAddress,
        invoiceNumber: data.invoiceNumber,
        date: new Date(data.date),
        taxRate: data.taxRate || 19,
        items: data.items || [],
        total: data.total || 0,
        taxAmount: data.taxAmount || 0,
        grandTotal: data.grandTotal || 0,
        timbreFiscal: data.timbreFiscal || 0.6,
        companyName: data.name || 'EduSpace Coworking',
        companyLogo: data.logo || '/logo.png',
        companyAddress: data.address || "24 Rue de l'Éducation, Tunis 1002",
        companyPhone: data.phone || '+216 70 123 456',
        companyEmail: data.email || 'contact@eduspace.tn',
        matriculeFiscale: data.matricule || 'MF12345678',
      },
    });
    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
  }
})

export const DELETE = authMiddleware (async(request, { params })=> {
  try {
    const id = parseInt(params.id);
    await prisma.invoice.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 });
  }
})