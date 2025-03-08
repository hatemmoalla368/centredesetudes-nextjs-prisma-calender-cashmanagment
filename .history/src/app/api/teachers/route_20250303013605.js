import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST: Add a new teacher
export async function POST(req) {
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
}

// GET: Fetch all teachers
export async function GET() {
  try {
    const teachers = await prisma.teacher.findMany({
      include: { schedules: true }, // Include schedules for each teacher
    });
    return NextResponse.json(teachers, { status: 200 });
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return NextResponse.json({ error: "Failed to fetch teachers." }, { status: 500 });
  }
}