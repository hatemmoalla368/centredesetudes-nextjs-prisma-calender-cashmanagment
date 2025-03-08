
import { NextResponse } from "next/server"; // Import NextResponse
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
// Handler for PUT (Update) and DELETE (Delete) requests for a specific schedule


export async function DELETE(req, { params }) {
  try {
    const { id } = params; // Extract schedule ID from the URL params

    // Delete the schedule by its ID
    const deletedSchedule = await prisma.schedule.delete({
      where: { id: parseInt(id) }, // Delete schedule using ID
    });

    // Return the deleted schedule data
    return NextResponse.json(deletedSchedule, { status: 200 });
  } catch (error) {
    console.error("Error deleting schedule:", error);
    return NextResponse.json({ message: "Failed to delete schedule" }, { status: 500 });
  }
}
export async function GET(req, { params }) {
    try {
      const { classroomId } = params;
  
      // Fetch schedules for the specific classroom
      const schedules = await prisma.schedule.findMany({
        where: {
          classroomId: parseInt(classroomId),
        },
      });
  
      return NextResponse.json(schedules, { status: 200 });
    } catch (error) {
      console.error("Error fetching schedules:", error);
      return NextResponse.json({ error: "Failed to fetch schedules." }, { status: 500 });
    }
  }