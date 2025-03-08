// src/app/api/schedules/route.js
import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma'; // Adjust the path if needed

// Handle GET request to fetch schedules
export async function GET() {
  try {
    const schedules = await prisma.schedule.findMany({
      include: {
        classroom: true, // Include classroom details if needed
      },
    });
    return NextResponse.json(schedules, { status: 200 });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return NextResponse.json({ error: 'Failed to fetch schedules' }, { status: 500 });
  }
}

// Handle POST request to create a new schedule
export async function POST(req) {
  try {
    const body = await req.json(); // Read request body
    const { classroomId, startTime, endTime, description } = body;

    // Create a new schedule in the database
    const newSchedule = await prisma.schedule.create({
      data: {
        classroomId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        description,
        recurringWeekly,
      },
    });

    return NextResponse.json(newSchedule, { status: 201 });
  } catch (error) {
    console.error('Error creating schedule:', error);
    return NextResponse.json({ error: 'Failed to create schedule' }, { status: 500 });
  }
}
