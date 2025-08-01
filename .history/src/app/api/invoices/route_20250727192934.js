import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '@/lib/auth';


const prisma = new PrismaClient();

export  const POST = authMiddleware(async(request)=> {
  try {
    const data = await request.json();
    if (!data.clientName || !data.clientAddress || !data.invoiceNumber || !data.date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const invoice = await prisma.invoice.create({
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
    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
})

export  const PUT = authMiddleware(async(request, { params })=> {
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

export  const GET = authMiddleware(async(request)=> {
  try {
    const { searchParams } = new URL(request.url);
    if (searchParams.get('latest')) {
      const latestInvoice = await prisma.invoice.findFirst({
        orderBy: { id: 'desc' },
        select: { invoiceNumber: true },
      });
      return NextResponse.json({ latestInvoice });
    }

    const invoices = await prisma.invoice.findMany({
      select: {
        id: true,
        invoiceNumber: true,
        clientName: true,
        date: true,
        grandTotal: true,
      },
    });
    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
})

export  const DELETE = authMiddleware (async(request, { params })=> {
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