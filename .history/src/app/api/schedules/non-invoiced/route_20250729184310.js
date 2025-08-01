import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '@/lib/auth';

const prisma = new PrismaClient();

export const GET = authMiddleware(async () => {
  try {
    const schedules = await prisma.schedule.findMany({
      where: { invoiced: false },
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