import prisma from "../../lib"; // Import Prisma client
import { NextResponse } from "next/server"; // Import NextResponse

// Handler for PUT (Update) and DELETE (Delete) requests for a specific schedule
export async function PUT(req, { params }) {
  try {
    const { id } = params; // Extract schedule ID from the URL params
    const { classroomId, startTime, endTime, description, recurringWeekly } = await req.json();

    // Ensure that classroomId is an integer and startTime, endTime are valid Date objects
    const updatedSchedule = await prisma.schedule.update({
      where: { id: parseInt(id) }, // Look up schedule by ID
      data: {
        classroomId: parseInt(classroomId), // Make sure the classroomId is an integer
        startTime: new Date(startTime), // Convert to a Date object
        endTime: new Date(endTime), // Convert to a Date object
        description,
        recurringWeekly,
      },
    });

    // Return the updated schedule
    return NextResponse.json(updatedSchedule, { status: 200 });
  } catch (error) {
    console.error("Error updating schedule:", error);
    return NextResponse.json({ message: "Failed to update schedule" }, { status: 500 });
  }
}

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
