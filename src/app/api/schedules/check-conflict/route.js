import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
<<<<<<< HEAD

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { classroomId, startTime, endTime } = await req.json();

    console.log("Received request with:", { classroomId, startTime, endTime });
=======
import { authMiddleware } from "@/lib/auth";

const prisma = new PrismaClient();

export const POST = authMiddleware (async(req, { params })=> {

  try {
    const { classroomId, startTime, endTime, excludeScheduleId } = await req.json();

    console.log("Received request with:", { classroomId, startTime, endTime, excludeScheduleId });
>>>>>>> ef74eb1 (Initial commit with Next.js coworking space management app)

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

<<<<<<< HEAD
    // Check for conflicting schedules
    const conflictingSchedules = await prisma.schedule.findMany({
      where: {
        classroomId: parseInt(classroomId),
=======
    // Check for conflicting schedules (excluding the specified schedule if provided)
    const conflictingSchedules = await prisma.schedule.findMany({
      where: {
        classroomId: parseInt(classroomId),
        NOT: excludeScheduleId ? { id: parseInt(excludeScheduleId) } : undefined,
>>>>>>> ef74eb1 (Initial commit with Next.js coworking space management app)
        OR: [
          {
            startTime: { lt: parsedEndTime }, // Existing schedule starts before the new one ends
            endTime: { gt: parsedStartTime }, // Existing schedule ends after the new one starts
          },
        ],
      },
<<<<<<< HEAD
=======
      include: {
        classroom: true,
        teacher: true,
      },
>>>>>>> ef74eb1 (Initial commit with Next.js coworking space management app)
    });

    console.log("Conflicting schedules:", conflictingSchedules);

    if (conflictingSchedules.length > 0) {
      console.log("Conflict detected.");
<<<<<<< HEAD
      return NextResponse.json(
        { error: "Classroom is already booked at the requested time." },
=======
      const conflict = conflictingSchedules[0];
      const conflictStart = conflict.startTime.toLocaleString();
      const conflictEnd = conflict.endTime.toLocaleString();
      const conflictInfo = {
        classroom: conflict.classroom.name,
        startTime: conflictStart,
        endTime: conflictEnd,
        teacher: conflict.teacher?.name || "No teacher assigned",
      };
      
      return NextResponse.json(
        { 
          error: "Classroom is already booked at the requested time.",
          conflictInfo 
        },
>>>>>>> ef74eb1 (Initial commit with Next.js coworking space management app)
        { status: 400 }
      );
    }

    console.log("No conflicts found.");
<<<<<<< HEAD
    return NextResponse.json({ message: "No conflicts found." }, { status: 200 });
  } catch (error) {
    console.error("Error checking for conflicts:", error);
    return NextResponse.json({ error: "Failed to check for conflicts." }, { status: 500 });
  }
}
=======
    return NextResponse.json({ available: true }, { status: 200 });
  } catch (error) {
    console.error("Error checking for conflicts:", error);
    return NextResponse.json(
      { error: "Failed to check for conflicts." }, 
      { status: 500 }
    );
  }
})
>>>>>>> ef74eb1 (Initial commit with Next.js coworking space management app)
