import { prisma } from '../../lib/prisma';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const classrooms = await prisma.classroom.findMany();
    res.status(200).json(classrooms);
  } else if (req.method === 'POST') {
    const { name, capacity, description } = req.body;
    const newClassroom = await prisma.classroom.create({
      data: {
        name,
        capacity,
        description,
      },
    });
    res.status(201).json(newClassroom);
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}




