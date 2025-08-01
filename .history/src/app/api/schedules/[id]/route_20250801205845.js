
import { NextResponse } from "next/server"; // Import NextResponse
import { PrismaClient } from "@prisma/client";
<<<<<<< HEAD
=======
import { authMiddleware } from "@/lib/auth";
>>>>>>> ef74eb1 (Initial commit with Next.js coworking space management app)

const prisma = new PrismaClient();
// Handler for PUT (Update) and DELETE (Delete) requests for a specific schedule


<<<<<<< HEAD
export async function DELETE(req, { params }) {
=======
export const DELETE = authMiddleware (async(request, { params })=> {

>>>>>>> ef74eb1 (Initial commit with Next.js coworking space management app)
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
<<<<<<< HEAD
}
export async function GET(req, { params }) {
=======
})
export const GET = authMiddleware (async(request, { params })=> {

>>>>>>> ef74eb1 (Initial commit with Next.js coworking space management app)
    try {
      // Extract classroomId from params
      const { id: classroomId } = params;
  
      // Validate classroomId
      if (!classroomId) {
        return NextResponse.json({ error: "Classroom ID is required." }, { status: 400 });
      }
  
      // Fetch schedules for the specific classroom
      const schedules = await prisma.schedule.findMany({
        where: {
          classroomId: parseInt(classroomId), // Ensure classroomId is an integer
        },
        include:{
          teacher:true
        }
      });
  
      // Return the schedules as a JSON response
      return NextResponse.json(schedules, { status: 200 });
    } catch (error) {
      console.error("Error fetching schedules:", error);
      return NextResponse.json({ error: "Failed to fetch schedules." }, { status: 500 });
    }
<<<<<<< HEAD
  }
=======
  })
 export const PUT = authMiddleware (async(request, { params })=> {
 
  try {
    // Get the ID from the URL
    const id = request.url.split('/').pop();
    
    // Parse the request body
    const body = await request.json();
    const { classroomId, teacherId, startTime, endTime, description, recurringWeekly } = body;

    // Convert to Date objects (no timezone conversion)
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

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

    return NextResponse.json(updatedSchedule, { status: 200 });
  } catch (error) {
    console.error('Error updating schedule:', error);
    return NextResponse.json(
      { error: 'Failed to update schedule' },
      { status: 500 }
    );
  }
})
>>>>>>> ef74eb1 (Initial commit with Next.js coworking space management app)
