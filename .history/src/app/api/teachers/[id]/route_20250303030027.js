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
}