import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
<<<<<<< HEAD
=======
import { authMiddleware } from "@/lib/auth";
>>>>>>> ef74eb1 (Initial commit with Next.js coworking space management app)

const prisma = new PrismaClient();

// POST: Add a new teacher
<<<<<<< HEAD
export async function POST(req) {
=======
export const POST = authMiddleware (async(req, { params })=> {

>>>>>>> ef74eb1 (Initial commit with Next.js coworking space management app)
  try {
    const { name, email, phone } = await req.json();

    // Validate input
    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
    }

    // Check if teacher already exists
    const existingTeacher = await prisma.teacher.findUnique({ where: { email } });
    if (existingTeacher) {
      return NextResponse.json({ error: "Teacher already exists." }, { status: 400 });
    }

    // Create the teacher
    const newTeacher = await prisma.teacher.create({
      data: {
        name,
        email,
        phone,
      },
    });

    return NextResponse.json(newTeacher, { status: 201 });
  } catch (error) {
    console.error("Error adding teacher:", error);
    return NextResponse.json({ error: "Failed to add teacher." }, { status: 500 });
  }
<<<<<<< HEAD
}
=======
})
>>>>>>> ef74eb1 (Initial commit with Next.js coworking space management app)

// GET: Fetch all teachers


<<<<<<< HEAD
export async function GET() {
    try {
      const teachers = await prisma.teacher.findMany({
        select: {
          id: true,
          name: true,
        },
      });
      return NextResponse.json(teachers, { status: 200 });
    } catch (error) {
      console.error("Error fetching teachers:", error);
      return NextResponse.json({ error: "Failed to fetch teachers." }, { status: 500 });
    }
  }
=======
export const GET = authMiddleware (async(request, { params })=> {

  try {
    const teachers = await prisma.teacher.findMany({
      include: {
        _count: {
          select: { groups: true, schedules: true, transactions: true },
        },
      },
    });
    // Transform data to include counts directly
    const formattedTeachers = teachers.map((teacher) => ({
      ...teacher,
      groups: { length: teacher._count.groups },
      schedules: { length: teacher._count.schedules },
      transactions: { length: teacher._count.transactions },
    }));
    return NextResponse.json(formattedTeachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return NextResponse.json({ error: 'Failed to fetch teachers' }, { status: 500 });
  }
})
>>>>>>> ef74eb1 (Initial commit with Next.js coworking space management app)
