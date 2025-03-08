import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Handle GET request (Fetch all schedules)
export async function GET() {
  try {
    const schedules = await prisma.schedule.findMany({
      include: { classroom: true },
    });
    return NextResponse.json(schedules);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch schedules" }, { status: 500 });
  }
}

// Handle POST request (Add a new schedule)
export async function POST(req) {
  try {
    // Parse incoming JSON body
    const { classroomId, startTime, endTime, description, recurringWeekly } = await req.json();

    // Ensure startTime and endTime are valid Date objects
    const parsedStartTime = new Date(startTime);
    const parsedEndTime = new Date(endTime);

    // Check if the parsed dates are valid
    if (isNaN(parsedStartTime.getTime()) || isNaN(parsedEndTime.getTime())) {
      return NextResponse.json({ error: 'Invalid date format provided.' }, { status: 400 });
    }

    // Create the schedule
    if (recurringWeekly) {
      const schedulesToCreate = [];

      // Get the month of the initial start time
      const initialMonth = parsedStartTime.getMonth();

      // Start with the initial date
      let currentStartTime = new Date(parsedStartTime);
      let currentEndTime = new Date(parsedEndTime);

      // Loop to create schedules for the same month
      while (currentStartTime.getMonth() === initialMonth) {
        schedulesToCreate.push({
          classroomId: parseInt(classroomId), // Ensure classroomId is an integer
          startTime: new Date(currentStartTime),
          endTime: new Date(currentEndTime),
          description,
          recurringWeekly: true,
        });

        // Move to the next week
        currentStartTime.setDate(currentStartTime.getDate() + 7);
        currentEndTime.setDate(currentEndTime.getDate() + 7);
      }

      // Use Prisma to create multiple schedules
      const createdSchedules = await prisma.schedule.createMany({
        data: schedulesToCreate,
      });

      return NextResponse.json(createdSchedules, { status: 201 });
    } else {
      // For non-recurring schedules, just create a single one
      const newSchedule = await prisma.schedule.create({
        data: {
          classroomId: parseInt(classroomId),
          startTime: parsedStartTime,
          endTime: parsedEndTime,
          description,
          recurringWeekly: false, // Set as false if it's not recurring
        },
      });

      return NextResponse.json(newSchedule, { status: 201 });
    }
  } catch (error) {
    console.error('Error creating schedule:', error);
    return NextResponse.json({ error: 'Failed to create schedule.' }, { status: 500 });
  }
}
