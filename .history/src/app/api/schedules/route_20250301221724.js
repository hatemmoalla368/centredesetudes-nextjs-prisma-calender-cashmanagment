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
export async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case "POST":
      // Create a new schedule
      try {
        const { classroomId, startTime, endTime, description, recurringWeekly } = req.body;
        const newSchedule = await prisma.schedule.create({
          data: {
            classroomId: parseInt(classroomId), // Ensure classroomId is an integer
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            description,
            recurringWeekly,
          },
        });
        return res.status(201).json(newSchedule);
      } catch (error) {
        console.error("Error creating schedule:", error);
        return res.status(500).json({ message: "Failed to create schedule" });
      }

    case "PUT":
      // Update an existing schedule
      try {
        const { id } = req.query;
        const { classroomId, startTime, endTime, description, recurringWeekly } = req.body;

        const updatedSchedule = await prisma.schedule.update({
          where: { id: parseInt(id) }, // Make sure the schedule ID is an integer
          data: {
            classroomId: parseInt(classroomId),
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            description,
            recurringWeekly,
          },
        });

        return res.status(200).json(updatedSchedule);
      } catch (error) {
        console.error("Error updating schedule:", error);
        return res.status(500).json({ message: "Failed to update schedule" });
      }

    case "DELETE":
      // Delete a schedule
      try {
        const { id } = req.query;

        const deletedSchedule = await prisma.schedule.delete({
          where: { id: parseInt(id) },
        });

        return res.status(200).json(deletedSchedule);
      } catch (error) {
        console.error("Error deleting schedule:", error);
        return res.status(500).json({ message: "Failed to delete schedule" });
      }

    default:
      res.setHeader("Allow", ["POST", "PUT", "DELETE"]);
      return res.status(405).json({ message: `Method ${method} Not Allowed` });
  }
}
