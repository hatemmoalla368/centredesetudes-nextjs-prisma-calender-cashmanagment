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
    const { classroomId, startTime, endTime, description, recurringWeekly, teacherId } = await req.json();

    // Validate input
    if (!classroomId || !startTime || !endTime) {
      return NextResponse.json({ error: "Classroom ID, start time, and end time are required." }, { status: 400 });
    }

    // Convert startTime and endTime to Date objects
    const parsedStartTime = new Date(startTime);
    const parsedEndTime = new Date(endTime);

    // Check for conflicting schedules
    const conflictingSchedules = await prisma.schedule.findMany({
      where: {
        classroomId: parseInt(classroomId),
        OR: [
          {
            startTime: { lt: parsedEndTime }, // Existing schedule starts before the new one ends
            endTime: { gt: parsedStartTime }, // Existing schedule ends after the new one starts
          },
        ],
      },
    });

    if (conflictingSchedules.length > 0) {
      return NextResponse.json(
        { error: "Classroom is already booked at the requested time." },
        { status: 400 }
      );
    }

    // Create the schedule
    const newSchedule = await prisma.schedule.create({
      data: {
        classroomId: parseInt(classroomId),
        startTime: parsedStartTime,
        endTime: parsedEndTime,
        description,
        recurringWeekly,
        teacherId: teacherId ? parseInt(teacherId) : null,
      },
    });

    return NextResponse.json(newSchedule, { status: 201 });
  } catch (error) {
    console.error("Error creating schedule:", error);
    return NextResponse.json({ error: "Failed to create schedule." }, { status: 500 });
  }
}
