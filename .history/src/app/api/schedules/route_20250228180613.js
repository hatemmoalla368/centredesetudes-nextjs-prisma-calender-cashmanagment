// pages/api/schedules.js
import { prisma } from '../../lib/prisma';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const schedules = await prisma.schedule.findMany({
        include: { classroom: true },
      });
      if (!schedules || schedules.length === 0) {
        return res.status(404).json({ message: 'No schedules found' });
      }
      res.status(200).json(schedules);
    }

    if (req.method === 'POST') {
      const { classroomId, startTime, endTime, recurringWeekly } = req.body;
      const newSchedule = await prisma.schedule.create({
        data: {
          classroomId,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          recurringWeekly,
        },
      });
      res.status(201).json(newSchedule);
    }
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
