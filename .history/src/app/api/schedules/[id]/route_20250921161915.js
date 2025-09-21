import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "@/lib/auth";
import { DateTime } from "luxon";

const prisma = new PrismaClient();

// Handle DELETE request
export const DELETE = authMiddleware(async (request, { params }) => {
  try {
    const { id } = params; // Extract schedule ID from the URL params

    // Delete the schedule by its ID
    const deletedSchedule = await prisma.schedule.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json(deletedSchedule, { status: 200 });
  } catch (error) {
    console.error("Error deleting schedule:", error);
    return NextResponse.json({ message: "Failed to delete schedule" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
});

// Handle GET request (Fetch schedules by classroom ID)
export const GET = authMiddleware(async (request, { params }) => {
  try {
    const { id: classroomId } = params;
    const timezone = "Asia/Jakarta"; // Replace with your local timezone

    // Validate classroomId
    if (!classroomId) {
      return NextResponse.json({ error: "Classroom ID is required." }, { status: 400 });
    }

    // Fetch schedules for the specific classroom
    const schedules = await prisma.schedule.findMany({
      where: {
        classroomId: parseInt(classroomId),
      },
      include: {
        teacher: true,
      },
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

    return NextResponse.json(formattedSchedules, { status: 200 });
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return NextResponse.json({ error: "Failed to fetch schedules." }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
});

// Handle PUT request (Update a schedule)
export const PUT = authMiddleware(async (request, { params }) => {
  try {
    const id = request.url.split("/").pop();
    const body = await request.json();
    const { classroomId, teacherId, startTime, endTime, description, recurringWeekly } = body;
    const timezone = "Asia/Jakarta"; // Replace with your local timezone

    // Convert to Date objects in local timezone and then to UTC
    const startDate = DateTime.fromISO(startTime, { zone: timezone }).toUTC().toJSDate();
    const endDate = DateTime.fromISO(endTime, { zone: timezone }).toUTC().toJSDate();

    // Update the schedule
    const updatedSchedule = await prisma.schedule.update({
      where: { id: parseInt(id) },
      data: {
        classroomId: parseInt(classroomId),
        teacherId: teacherId ? parseInt(teacherId) : null,
        startTime: startDate,
        endTime: endDate,
        description,
        recurringWeekly,
      },
      include: {
        classroom: true,
        teacher: true,
      },
    });

    // Convert updated schedule dates back to local timezone
    const formattedSchedule = {
      ...updatedSchedule,
      startTime: DateTime.fromJSDate(updatedSchedule.startTime, { zone: "utc" })
        .setZone(timezone)
        .toISO(),
      endTime: DateTime.fromJSDate(updatedSchedule.endTime, { zone: "utc" })
        .setZone(timezone)
        .toISO(),
    };

    return NextResponse.json(formattedSchedule, { status: 200 });
  } catch (error) {
    console.error("Error updating schedule:", error);
    return NextResponse.json({ error: "Failed to update schedule" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
});