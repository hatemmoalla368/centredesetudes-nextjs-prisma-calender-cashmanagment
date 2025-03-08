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
    // Parse incoming JSON body ONCE
    const requestBody = await req.json();

    // Check if the request contains an array of schedules
    if (requestBody.schedules && Array.isArray(requestBody.schedules)) {
      // Process recurring schedules
      const createdSchedules = [];

      for (const schedule of requestBody.schedules) {
        const { classroomId, startTime, endTime, description, recurringWeekly, teacherId } = schedule;

        // Ensure startTime and endTime are valid Date objects
        const parsedStartTime = new Date(startTime);
        const parsedEndTime = new Date(endTime);

        // Check if the parsed dates are valid
        if (isNaN(parsedStartTime.getTime()) || isNaN(parsedEndTime.getTime())) {
          console.error("Invalid date format provided for schedule:", schedule);
          continue; // Skip this schedule and continue with the next one
        }

        // Create the schedule
        const newSchedule = await prisma.schedule.create({
          data: {
            classroomId: parseInt(classroomId),
            startTime: parsedStartTime,
            endTime: parsedEndTime,
            description,
            recurringWeekly,
            teacherId: teacherId ? parseInt(teacherId) : null, // Link to teacher if provided
          },
        });

        createdSchedules.push(newSchedule);
      }

      return NextResponse.json(createdSchedules, { status: 201 });
    } else {
      // For non-recurring schedules, process a single schedule
      const { classroomId, startTime, endTime, description, recurringWeekly, teacherId } = requestBody;

      // Ensure startTime and endTime are valid Date objects
      const parsedStartTime = new Date(startTime);
      const parsedEndTime = new Date(endTime);

      // Check if the parsed dates are valid
      if (isNaN(parsedStartTime.getTime()) || isNaN(parsedEndTime.getTime())) {
        return NextResponse.json({ error: "Invalid date format provided." }, { status: 400 });
      }

      // Create the schedule
      const newSchedule = await prisma.schedule.create({
        data: {
          classroomId: parseInt(classroomId),
          startTime: parsedStartTime,
          endTime: parsedEndTime,
          description,
          recurringWeekly,
          teacherId: teacherId ? parseInt(teacherId) : null, // Link to teacher if provided
        },
      });

      return NextResponse.json(newSchedule, { status: 201 });
    }
  } catch (error) {
    console.error("Error creating schedule:", error);
    return NextResponse.json({ error: "Failed to create schedule." }, { status: 500 });
  }
}
