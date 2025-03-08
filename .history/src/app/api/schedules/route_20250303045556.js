import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Handle GET request (Fetch all schedules)
export async function GET() {
  try {
    const schedules = await prisma.schedule.findMany({
      include: { classroom: true, teacher:true },
    });
    return NextResponse.json(schedules);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch schedules" }, { status: 500 });
  }
}

// Handle POST request (Add a new schedule)


export async function POST(req) {
  try {
    const { schedules } = await req.json();

    // Validate input
    if (!schedules || !Array.isArray(schedules)) {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    // Create all schedules
    const createdSchedules = await prisma.schedule.createMany({
      data: schedules.map((schedule) => ({
        classroomId: parseInt(schedule.classroomId),
        startTime: new Date(schedule.startTime),
        endTime: new Date(schedule.endTime),
        description: schedule.description,
        recurringWeekly: schedule.recurringWeekly,
        teacherId: schedule.teacherId ? parseInt(schedule.teacherId) : null,
      })),
    });

    return NextResponse.json(createdSchedules, { status: 201 });
  } catch (error) {
    console.error("Error creating schedules:", error);
    return NextResponse.json({ error: "Failed to create schedules." }, { status: 500 });
  }
}
