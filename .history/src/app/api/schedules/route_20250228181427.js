// pages/api/schedules.js
import { prisma } from '../../lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const schedules = await prisma.schedule.findMany({
      include: { classroom: true },
    });

    if (!schedules || schedules.length === 0) {
      return NextResponse.json({ message: 'No schedules found' }, { status: 404 });
    }

    return NextResponse.json(schedules, { status: 200 });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST Method for creating new schedule
export async function POST(req) {
  try {
    const { classroomId, startTime, endTime, description } = await req.json(); // Parsing the request body

    // Validate the data
    if (!classroomId || !startTime || !endTime || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create a new schedule in the database
    const newSchedule = await prisma.schedule.create({
      data: {
        classroomId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        description,
      },
    });

    return NextResponse.json(newSchedule, { status: 201 }); // Return the created schedule
  } catch (error) {
    console.error('Error creating schedule:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
