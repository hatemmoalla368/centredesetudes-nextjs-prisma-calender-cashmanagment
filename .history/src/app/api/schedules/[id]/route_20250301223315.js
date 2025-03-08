import prisma from "../../../lib/prisma"; // Import Prisma client

// Handler for PUT (Update) and DELETE (Delete) requests for a specific schedule
export async function handler(req, res) {
  const { method } = req; 
  const { id } = req.query; // Extract the schedule ID from the URL parameter

  switch (method) {
    case "PUT":
      // Handle PUT request (Update schedule by ID)
      try {
        const { classroomId, startTime, endTime, description, recurringWeekly } = req.body;

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

        // Respond with the updated schedule data
        return res.status(200).json(updatedSchedule);
      } catch (error) {
        console.error("Error updating schedule:", error);
        return res.status(500).json({ message: "Failed to update schedule" });
      }

    case "DELETE":
      // Handle DELETE request (Delete schedule by ID)
      try {
        const deletedSchedule = await prisma.schedule.delete({
          where: { id: parseInt(id) }, // Delete schedule using ID
        });

        // Respond with the deleted schedule data
        return res.status(200).json(deletedSchedule);
      } catch (error) {
        console.error("Error deleting schedule:", error);
        return res.status(500).json({ message: "Failed to delete schedule" });
      }

    default:
      // If the method is neither PUT nor DELETE, return a Method Not Allowed error
      res.setHeader("Allow", ["PUT", "DELETE"]);
      return res.status(405).json({ message: `Method ${method} Not Allowed` });
  }
}

export default handler;
