import { prisma } from '../../lib/prisma';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const schedules = await prisma.schedule.findMany({
      include: {
        classroom: true,
      },
    });
    res.status(200).json(schedules);
  } else if (req.method === 'POST') {
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
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
