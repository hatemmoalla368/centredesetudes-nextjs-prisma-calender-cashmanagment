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
export async function POST(req, res) {
  const { classroomId, startTime, endTime, description, recurringWeekly } = req.body;

  try {
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    if (recurringWeekly) {
      const schedules = [];

      // Repeat for 4 weeks, you can adjust the number of weeks here
      for (let i = 0; i < 4; i++) {
        // Create a new schedule for the current week
        const newSchedule = await prisma.schedule.create({
          data: {
            classroomId: parseInt(classroomId), // Ensure classroomId is an integer
            startTime: new Date(startDate.setDate(startDate.getDate() + 7 * i)), // Add 7 days to the start time
            endTime: new Date(endDate.setDate(endDate.getDate() + 7 * i)), // Add 7 days to the end time
            description,
            recurringWeekly,
          },
        });
        schedules.push(newSchedule);
      }

      return res.status(201).json(schedules); // Return all created schedules
    }

    // For non-recurring schedules, just create a single one
    const newSchedule = await prisma.schedule.create({
      data: {
        classroomId: parseInt(classroomId),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        description,
        recurringWeekly,
      },
    });

    return res.status(201).json(newSchedule);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to create schedule" });
  }
}

