import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '@/lib/auth';

const prisma = new PrismaClient();

export const POST = authMiddleware(async (request) => {
  try {
    const data = await request.json();
    const { clientName, clientAddress, invoiceNumber, date, scheduleIds } = data;

    if (!clientName || !clientAddress || !invoiceNumber || !date) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
    }

    const invoice = await prisma.invoice.create({
      data: {
        clientName,
        clientAddress,
        invoiceNumber,
        date: new Date(date),
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
        schedules: scheduleIds ? { connect: scheduleIds.map((id) => ({ id })) } : undefined,
      },
    });

    // Mark schedules as invoiced if scheduleIds are provided
    if (scheduleIds && scheduleIds.length > 0) {
      await prisma.schedule.updateMany({
        where: { id: { in: scheduleIds } },
        data: { invoiced: true, invoiceId: invoice.id },
      });
    }

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la facture:', error);
    return NextResponse.json({ error: 'Échec de la création de la facture' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
});

export const PUT = authMiddleware(async (request, { params }) => {
  try {
    const id = parseInt(params.id);
    const data = await request.json();
    if (!data.clientName || !data.clientAddress || !data.invoiceNumber || !data.date) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
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
    console.error('Erreur lors de la mise à jour de la facture:', error);
    return NextResponse.json({ error: 'Échec de la mise à jour de la facture' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
});

export const GET = authMiddleware(async (request) => {
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
        schedules: true,
      },
    });
    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Erreur lors de la récupération des factures:', error);
    return NextResponse.json({ error: 'Échec de la récupération des factures' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
});

export const DELETE = authMiddleware(async (request, { params }) => {
  try {
    const id = parseInt(params.id);
    await prisma.invoice.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Facture supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la facture:', error);
    return NextResponse.json({ error: 'Échec de la suppression de la facture' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
});