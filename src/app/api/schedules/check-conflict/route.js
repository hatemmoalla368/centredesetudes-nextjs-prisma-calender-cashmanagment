import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { classroomId, startTime, endTime } = await req.json();

    console.log("Received request with:", { classroomId, startTime, endTime });

    // Convert startTime and endTime to Date objects
    const parsedStartTime = new Date(startTime);
    const parsedEndTime = new Date(endTime);

    console.log("Parsed times:", { parsedStartTime, parsedEndTime });

    // Validate that endTime is after startTime
    if (parsedEndTime <= parsedStartTime) {
      return NextResponse.json(
        { error: "End time must be after start time." },
        { status: 400 }
      );
    }

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

    console.log("Conflicting schedules:", conflictingSchedules);

    if (conflictingSchedules.length > 0) {
      console.log("Conflict detected.");
      return NextResponse.json(
        { error: "Classroom is already booked at the requested time." },
        { status: 400 }
      );
    }

    console.log("No conflicts found.");
    return NextResponse.json({ message: "No conflicts found." }, { status: 200 });
  } catch (error) {
    console.error("Error checking for conflicts:", error);
    return NextResponse.json({ error: "Failed to check for conflicts." }, { status: 500 });
  }
}