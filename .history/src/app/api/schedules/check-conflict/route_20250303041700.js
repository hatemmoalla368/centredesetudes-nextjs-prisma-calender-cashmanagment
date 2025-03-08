import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { classroomId, startTime, endTime } = await req.json();

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

    return NextResponse.json({ message: "No conflicts found." }, { status: 200 });
  } catch (error) {
    console.error("Error checking for conflicts:", error);
    return NextResponse.json({ error: "Failed to check for conflicts." }, { status: 500 });
  }
}