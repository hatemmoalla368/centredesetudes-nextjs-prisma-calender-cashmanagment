import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '@/lib/auth';

const prisma = new PrismaClient();

export const GET = authMiddleware (async(request, { params })=> {

  try {
    const students = await prisma.student.findMany({
      include: {
        group: true, // Include group information if needed
      },
      orderBy: {
        name: 'asc', // Optional: sort by name
      },
    });
    return NextResponse.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
})