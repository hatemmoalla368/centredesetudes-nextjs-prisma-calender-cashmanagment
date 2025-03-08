// pages/api/classrooms.js
import { prisma } from '../../lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const classrooms = await prisma.classroom.findMany();

    if (!classrooms || classrooms.length === 0) {
      return NextResponse.json({ message: 'No classrooms found' }, { status: 404 });
    }

    return NextResponse.json(classrooms, { status: 200 });
  } catch (error) {
    console.error('Error fetching classrooms:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
