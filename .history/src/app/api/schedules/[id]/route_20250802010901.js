// src/app/api/schedules/[id]/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '@/lib/auth';
import { z } from 'zod';

const prisma = new PrismaClient();

const scheduleSchema = z.object({
  classroomId: z.string().min(1, 'Classroom ID is required'),
  teacherId: z.string().optional(),
  startTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid start time',
  }),
  endTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid end time',
  }),
  description: z.string().optional(),
  recurringWeekly: z.boolean(),
});

export const GET = authMiddleware(async (request, { params }) => {
  try {
    const { id } = params;
    const schedule = await prisma.schedule.findUnique({
      where: { id: parseInt(id) },
      include: { classroom: true, teacher: true },
    });
    if (!schedule) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    }
    return NextResponse.json(schedule, { status: 200 });
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json({ error: 'Failed to fetch schedule', details: error.message }, { status: 500 });
  }
});

// src/app/api/schedules/[id]/route.js
export const PUT = authMiddleware(async (request, { params }) => {
  try {
    const { id } = params;
    const body = await request.json();
    
    console.log('Received update data:', body); // Debug log

    // More flexible parsing
    const parsed = scheduleSchema.safeParse({
      ...body,
      classroomId: String(body.classroomId), // Ensure string
      teacherId: body.teacherId ? String(body.teacherId) : undefined,
    });

    if (!parsed.success) {
      console.error('Validation error:', parsed.error);
      return NextResponse.json({ error: parsed.error.errors }, { status: 400 });
    }

    const { classroomId, teacherId, startTime, endTime, description, recurringWeekly } = parsed.data;

    // Additional validation
    if (new Date(endTime) <= new Date(startTime)) {
      return NextResponse.json({ error: 'End time must be after start time' }, { status: 400 });
    }

    // Validate classroom exists
    const classroom = await prisma.classroom.findUnique({ 
      where: { id: parseInt(classroomId) } 
    });
    if (!classroom) {
      return NextResponse.json({ error: 'Classroom not found' }, { status: 404 });
    }

    // Validate teacher exists if provided
    if (teacherId) {
      const teacher = await prisma.teacher.findUnique({ 
        where: { id: parseInt(teacherId) } 
      });
      if (!teacher) {
        return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
      }
    }

    const updatedSchedule = await prisma.schedule.update({
      where: { id: parseInt(id) },
      data: {
        classroomId: parseInt(classroomId),
        teacherId: teacherId ? parseInt(teacherId) : null,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        description: description || null,
        recurringWeekly,
      },
      include: { classroom: true, teacher: true },
    });

    return NextResponse.json(updatedSchedule, { status: 200 });
  } catch (error) {
    console.error('Error updating schedule:', error);
    return NextResponse.json(
      { error: 'Failed to update schedule', details: error.message },
      { status: 500 }
    );
  }
});
export const DELETE = authMiddleware(async (request, { params }) => {
  try {
    const { id } = params;
    const schedule = await prisma.schedule.findUnique({ where: { id: parseInt(id) } });
    if (!schedule) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    }
    await prisma.schedule.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ message: 'Schedule deleted' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    return NextResponse.json({ error: 'Failed to delete schedule', details: error.message }, { status: 500 });
  }
});