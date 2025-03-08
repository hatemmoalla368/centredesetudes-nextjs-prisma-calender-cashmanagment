// pages/api/schedules/route.js
import { prisma } from '../../../lib/prisma'; // Adjust the path if necessary

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Fetch schedules from the database using Prisma
      const schedules = await prisma.schedule.findMany({
        include: {
          classroom: true, // Include classroom data if needed
        },
      });

      return res.status(200).json(schedules); // Return the list of schedules
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to fetch schedules' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { classroomId, startTime, endTime, description } = req.body;

      // Add a new schedule to the database using Prisma
      const newSchedule = await prisma.schedule.create({
        data: {
          classroomId,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          description,
        },
      });

      return res.status(201).json(newSchedule); // Return the newly created schedule
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to create schedule' });
    }
  }

  // If the method is not GET or POST, return Method Not Allowed
  return res.status(405).json({ error: 'Method Not Allowed' });
}
