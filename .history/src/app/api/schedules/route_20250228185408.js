// pages/api/schedules/route.js
import { prisma } from '../../lib/prisma'; // Adjust the path to your Prisma setup

export default async function handler(req, res) {
  // Handle GET request to fetch all schedules
  if (req.method === 'GET') {
    try {
      const schedules = await prisma.schedule.findMany({
        include: {
          classroom: true, // Include classroom details if needed
        },
      });
      return res.status(200).json(schedules); // Return the schedules list
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to fetch schedules' });
    }
  }

  // Handle POST request to create a new schedule
  if (req.method === 'POST') {
    try {
      const { classroomId, startTime, endTime, description } = req.body;

      // Create a new schedule in the database
      const newSchedule = await prisma.schedule.create({
        data: {
          classroomId,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          description,
        },
      });
      return res.status(201).json(newSchedule); // Return the created schedule
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to create schedule' });
    }
  }

  // If the method is neither GET nor POST, return Method Not Allowed
  return res.status(405).json({ error: 'Method Not Allowed' });
}
