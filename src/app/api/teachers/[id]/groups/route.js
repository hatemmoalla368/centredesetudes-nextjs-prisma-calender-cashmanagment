import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '@/lib/auth';

const prisma = new PrismaClient();

export const GET = authMiddleware (async(request, { params })=> {
  try {
    const groups = await prisma.group.findMany({
      where: { teacherId: parseInt(params.id) },
      include: { students: true }
    });
    return NextResponse.json(groups);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch groups" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
})