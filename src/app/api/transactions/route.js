<<<<<<< HEAD
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Fetch transactions (with optional filters)
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // "income" or "expense"
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build the query filters
    const filters = {};
    if (type) filters.type = type;
    if (startDate && endDate) {
      filters.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    // Fetch transactions
    const transactions = await prisma.transaction.findMany({
      where: filters,
      orderBy: { date: "desc" }, // Sort by date (newest first)
=======
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
>>>>>>> ef74eb1 (Initial commit with Next.js coworking space management app)
    });

    return NextResponse.json(transactions, { status: 200 });
  } catch (error) {
<<<<<<< HEAD
    console.error("Error fetching transactions:", error);
    return NextResponse.json({ error: "Failed to fetch transactions." }, { status: 500 });
  }
}

// POST: Add a new transaction
export async function POST(req) {
  try {
    const { type, amount, description, category, date } = await req.json();

    // Validate input
    if (!type || !amount || !description || !category) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    // Create the transaction
    const newTransaction = await prisma.transaction.create({
      data: {
        type,
        amount: parseFloat(amount),
        description,
        category,
        date: new Date(date)
      },
    });
console.log()
    return NextResponse.json(newTransaction, { status: 201 });
  } catch (error) {
    console.error("Error adding transaction:", error);
    return NextResponse.json({ error: "Failed to add transaction." }, { status: 500 });
  }
}
=======
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
>>>>>>> ef74eb1 (Initial commit with Next.js coworking space management app)
