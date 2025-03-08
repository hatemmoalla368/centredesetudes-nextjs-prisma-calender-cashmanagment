import { prisma } from '../../lib/prisma';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const schedules = await prisma.schedule.findMany({
      include: { classroom: true },
    });
    res.json(schedules);
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
    res.json(newSchedule);
  }
}
