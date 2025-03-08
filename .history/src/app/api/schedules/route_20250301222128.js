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
    const body = await req.json();
    const { classroomId, startTime, endTime, description, recurringWeekly } = body;

    if (!classroomId || !startTime || !endTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newSchedule = await prisma.schedule.create({
      data: {
        classroomId: parseInt(classroomId, 10), // Ensure it's an integer
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        description,
        recurringWeekly,
      },
    });

    return NextResponse.json(newSchedule);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create schedule" }, { status: 500 });
  }
}
