import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "@/lib/auth";
import { DateTime } from "luxon";

const prisma = new PrismaClient();

export const POST = authMiddleware(async (req, { params }) => {
  try {
    const { classroomId, startTime, endTime, excludeScheduleId } = await req.json();
    const timezone = "Asia/Jakarta"; // Replace with your local timezone

    console.log("Received request with:", { classroomId, startTime, endTime, excludeScheduleId });

    // Convert startTime and endTime to UTC for database query
    const parsedStartTime = DateTime.fromISO(startTime, { zone: timezone }).toUTC().toJSDate();
    const parsedEndTime = DateTime.fromISO(endTime, { zone: timezone }).toUTC().toJSDate();

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
        NOT: excludeScheduleId ? { id: parseInt(excludeScheduleId) } : undefined,
        OR: [
          {
            startTime: { lt: parsedEndTime },
            endTime: { gt: parsedStartTime },
          },
        ],
      },
      include: {
        classroom: true,
        teacher: true,
      },
    });

    console.log("Conflicting schedules:", conflictingSchedules);

    if (conflictingSchedules.length > 0) {
      console.log("Conflict detected.");
      const conflict = conflictingSchedules[0];
      const conflictStart = DateTime.fromJSDate(conflict.startTime, { zone: "utc" })
        .setZone(timezone)
        .toLocaleString();
      const conflictEnd = DateTime.fromJSDate(conflict.endTime, { zone: "utc" })
        .setZone(timezone)
        .toLocaleString();
      const conflictInfo = {
        classroom: conflict.classroom.name,
        startTime: conflictStart,
        endTime: conflictEnd,
        teacher: conflict.teacher?.name || "No teacher assigned",
      };

      return NextResponse.json(
        {
          error: "Classroom is already booked at the requested time.",
          conflictInfo,
        },
        { status: 400 }
      );
    }

    console.log("No conflicts found.");
    return NextResponse.json({ available: true }, { status: 200 });
  } catch (error) {
    console.error("Error checking for conflicts:", error);
    return NextResponse.json(
      { error: "Failed to check for conflicts." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
});