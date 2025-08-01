<<<<<<< HEAD
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req, { params }) {
  try {
    const { id } = params;

    // Fetch teacher profile with schedules
    const teacher = await prisma.teacher.findUnique({
        where: { id: parseInt(id) },
        include: {
          schedules: {
            include: {
              classroom: true, // Include classroom details for each schedule
            },
          },
        },
      });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found." }, { status: 404 });
    }

    return NextResponse.json(teacher, { status: 200 });
  } catch (error) {
    console.error("Error fetching teacher profile:", error);
    return NextResponse.json({ error: "Failed to fetch teacher profile." }, { status: 500 });
  }
=======
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '@/lib/auth';

const prisma = new PrismaClient();

export const GET = authMiddleware(async (request, { params }) => {
  try {
    const { id } = params;
    const url = new URL(request.url);
    const includeGroups = url.searchParams.get('includeGroups') === 'true';

    const teacher = await prisma.teacher.findUnique({
      where: { id: parseInt(id, 10) },
      include: includeGroups
        ? {
            groups: {
              include: { students: true },
            },
            schedules: {
              include: { classroom: true },
            },
            _count: {
              select: { groups: true, schedules: true, transactions: true },
            },
          }
        : {
            schedules: {
              include: { classroom: true },
            },
          },
    });

    if (!teacher) {
      return NextResponse.json(
        { error: 'Enseignant non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(teacher);
  } catch (error) {
    console.error('Erreur lors de la récupération de l’enseignant:', error);
    return NextResponse.json(
      { error: 'Échec de la récupération de l’enseignant' },
      { status: 500 }
    );
  }
});

export const PUT = authMiddleware(async (request, { params }) => {
  try {
    const { id } = params;
    const { name, email, phone, groups = [] } = await request.json();

    // Validate input
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Le nom et l’email sont requis' },
        { status: 400 }
      );
    }

    // Start a transaction for atomic updates
    const result = await prisma.$transaction(async (prisma) => {
      // Update teacher's basic info
      const updatedTeacher = await prisma.teacher.update({
        where: { id: parseInt(id, 10) },
        data: { name, email, phone },
      });

      // Get existing groups with students
      const existingGroups = await prisma.group.findMany({
        where: { teacherId: parseInt(id, 10) },
        include: { students: true },
      });

      // Process group updates
      await processGroups(prisma, parseInt(id, 10), groups, existingGroups);

      // Return the updated teacher with groups and students
      return await prisma.teacher.findUnique({
        where: { id: parseInt(id, 10) },
        include: {
          groups: {
            include: { students: true },
          },
          schedules: {
            include: { classroom: true },
          },
        },
      });
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l’enseignant:', error);
    return NextResponse.json(
      { error: 'Échec de la mise à jour de l’enseignant' },
      { status: 500 }
    );
  }
});

export const DELETE = authMiddleware(async (request, { params }) => {
  try {
    const { id } = params;

    // Start a transaction for atomic deletion
    const result = await prisma.$transaction(async (prisma) => {
      // Find groups for the teacher
      const groups = await prisma.group.findMany({
        where: { teacherId: parseInt(id, 10) },
        select: { id: true },
      });

      // Delete students in these groups
      await prisma.student.deleteMany({
        where: {
          groupId: { in: groups.map((group) => group.id) },
        },
      });

      // Delete groups
      await prisma.group.deleteMany({
        where: { teacherId: parseInt(id, 10) },
      });

      // Delete schedules
      await prisma.schedule.deleteMany({
        where: { teacherId: parseInt(id, 10) },
      });

      // Delete the teacher
      const deletedTeacher = await prisma.teacher.delete({
        where: { id: parseInt(id, 10) },
      });

      return deletedTeacher;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erreur lors de la suppression de l’enseignant:', error);
    return NextResponse.json(
      { error: 'Échec de la suppression de l’enseignant' },
      { status: 500 }
    );
  }
});

async function processGroups(prisma, teacherId, newGroups, existingGroups) {
  const groupUpdates = [];
  const studentUpdates = [];
  const deletions = [];

  // Process each new group
  for (const newGroup of newGroups) {
    if (newGroup.id) {
      // Update existing group
      groupUpdates.push(
        prisma.group.update({
          where: { id: newGroup.id },
          data: { name: newGroup.name },
        })
      );

      // Process students in existing group
      const existingStudents = existingGroups.find((g) => g.id === newGroup.id)?.students || [];

      // Update existing students
      newGroup.students?.filter((s) => s.id).forEach((student) => {
        studentUpdates.push(
          prisma.student.update({
            where: { id: student.id },
            data: { name: student.name, phone: student.phone },
          })
        );
      });

      // Create new students
      newGroup.students?.filter((s) => !s.id).forEach((student) => {
        studentUpdates.push(
          prisma.student.create({
            data: {
              name: student.name,
              phone: student.phone,
              groupId: newGroup.id,
            },
          })
        );
      });

      // Mark students for deletion
      const studentsToKeep = newGroup.students?.filter((s) => s.id).map((s) => s.id) || [];
      const studentsToDelete = existingStudents
        .filter((s) => !studentsToKeep.includes(s.id))
        .map((s) => s.id);

      if (studentsToDelete.length > 0) {
        deletions.push(
          prisma.student.deleteMany({
            where: { id: { in: studentsToDelete } },
          })
        );
      }
    } else {
      // Create new group with students
      groupUpdates.push(
        prisma.group.create({
          data: {
            name: newGroup.name,
            teacherId,
            students: {
              create: newGroup.students?.map((student) => ({
                name: student.name,
                phone: student.phone,
              })) || [],
            },
          },
        })
      );
    }
  }

  // Mark groups for deletion
  const groupsToKeep = newGroups.filter((g) => g.id).map((g) => g.id);
  const groupsToDelete = existingGroups
    .filter((g) => !groupsToKeep.includes(g.id))
    .map((g) => g.id);

  if (groupsToDelete.length > 0) {
    deletions.push(
      prisma.student.deleteMany({
        where: { groupId: { in: groupsToDelete } },
      })
    );
    deletions.push(
      prisma.group.deleteMany({
        where: { id: { in: groupsToDelete } },
      })
    );
  }

  // Execute operations in sequence
  await Promise.all(groupUpdates);
  await Promise.all(studentUpdates);
  await Promise.all(deletions);
>>>>>>> ef74eb1 (Initial commit with Next.js coworking space management app)
}