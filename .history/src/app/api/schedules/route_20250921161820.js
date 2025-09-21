import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "@/lib/auth";
import { DateTime } from "luxon";

const prisma = new PrismaClient();

// Handle GET request (Fetch all schedules)
export const GET = authMiddleware(async (request, { params }) => {
  try {
    const timezone = "Africa/Tunis"; // Replace with your local timezone
    const schedules = await prisma.schedule.findMany({
      include: { classroom: true, teacher: true },
    });

    // Convert UTC dates to local timezone
    const formattedSchedules = schedules.map((schedule) => ({
      ...schedule,
      startTime: DateTime.fromJSDate(schedule.startTime, { zone: "utc" })
        .setZone(timezone)
        .toISO(),
      endTime: DateTime.fromJSDate(schedule.endTime, { zone: "utc" })
        .setZone(timezone)
        .toISO(),
    }));

    return NextResponse.json(formattedSchedules);
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return NextResponse.json({ error: "Failed to fetch schedules" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
});

// Handle POST request (Add a new schedule)
export const POST = authMiddleware(async (req, { params }) => {
  try {
    const { schedules } = await req.json();
    const timezone = "Asia/Jakarta"; // Replace with your local timezone

    // Validate input
    if (!schedules || !Array.isArray(schedules)) {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    // Create all schedules
    const createdSchedules = await prisma.schedule.createMany({
      data: schedules.map((schedule) => {
        // Convert startTime and endTime to UTC for storage
        const startTime = DateTime.fromISO(schedule.startTime, { zone: timezone }).toUTC().toJSDate();
        const endTime = DateTime.fromISO(schedule.endTime, { zone: timezone }).toUTC().toJSDate();

        return {
          classroomId: parseInt(schedule.classroomId),
          startTime,
          endTime,
          description: schedule.description,
          recurringWeekly: schedule.recurringWeekly,
          teacherId: schedule.teacherId ? parseInt(schedule.teacherId) : null,
        };
      }),
    });

    return NextResponse.json(createdSchedules, { status: 201 });
  } catch (error) {
    console.error("Error creating schedules:", error);
    return NextResponse.json({ error: "Failed to create schedules." }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
});