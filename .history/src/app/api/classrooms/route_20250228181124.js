// pages/api/classrooms.js
import { prisma } from '../../lib/prisma';

export default async function handler(req, res) {
  try {
    const classrooms = await prisma.classroom.findMany();
    if (!classrooms || classrooms.length === 0) {
      return res.status(404).json({ message: 'No classrooms found' });
    }
    res.status(200).json(classrooms);
  } catch (error) {
    console.error('Error fetching classrooms:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
