import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '@/lib/auth';

const prisma = new PrismaClient();

export const GET = authMiddleware(async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type');
    const noReceipt = searchParams.get('noReceipt') === 'true';

    let where = {};

    if (noReceipt) {
      where.type = 'income';
      where.hasReceipt = false;
    } else {
      if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date.gte = new Date(startDate);
        if (endDate) where.date.lte = new Date(endDate);
      }
      if (type && type !== 'all') {
        where.type = type;
      }
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        teacher: true,
        student: true,
        group: true,
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(transactions, { status: 200 });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
});

export const POST = authMiddleware(async (request) => {
  try {
    const data = await request.json();

    const transaction = await prisma.transaction.create({
      data: {
        type: data.type,
        amount: parseFloat(data.amount),
        description: data.description,
        status: data.status,
        category: data.category || 'other',
        date: data.date ? new Date(data.date) : new Date(),
        teacherId: data.teacherId ? parseInt(data.teacherId) : null,
        studentId: data.studentId ? parseInt(data.studentId) : null,
        groupId: data.groupId ? parseInt(data.groupId) : null,
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
});

export const DELETE = authMiddleware(async (request) => {
  try {
    const id = parseInt(request.nextUrl.pathname.split('/').pop());
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: { receipt: true },
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Delete associated receipt if it exists
    if (transaction.receipt) {
      await prisma.receipt.delete({ where: { id: transaction.receipt.id } });
    }

    await prisma.transaction.delete({ where: { id } });
    return NextResponse.json({ message: 'Transaction deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 });
  }
});