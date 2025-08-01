import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '@/lib/auth';

const prisma = new PrismaClient();

export const GET = authMiddleware(async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');

    const where = { invoiced: false };
    if (teacherId) {
      where.teacherId = parseInt(teacherId);
    }

    const schedules = await prisma.schedule.findMany({
      where,
      include: {
        teacher: { select: { name: true } },
        classroom: { select: { name: true } },
      },
    });
    return NextResponse.json(schedules);
  } catch (error) {
    console.error('Erreur lors de la récupération des horaires non facturés:', error);
    return NextResponse.json(
      { error: 'Échec de la récupération des horaires non facturés' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
});