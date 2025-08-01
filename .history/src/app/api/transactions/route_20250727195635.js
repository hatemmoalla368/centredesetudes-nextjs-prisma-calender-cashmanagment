import { authMiddleware } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET (Fetch transactions)
export const GET = authMiddleware (async(request, { params })=> {

  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type');

    let where = {};

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    if (type && type !== 'all') {
      where.type = type;
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

    return new Response(JSON.stringify(transactions), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch transactions' }), {
      status: 500,
    });
  }
})

// POST (Create new transaction)
export const POST = authMiddleware (async(request, { params })=> {
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

    return new Response(JSON.stringify(transaction), { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return new Response(JSON.stringify({ error: 'Failed to create transaction' }), { 
      status: 500 
    });
  }
})

// PUT (Update existing transaction)
