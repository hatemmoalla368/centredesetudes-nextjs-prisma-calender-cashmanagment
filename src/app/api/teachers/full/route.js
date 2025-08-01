import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "@/lib/auth";

const prisma = new PrismaClient();

export const POST = authMiddleware (async(req, { params })=> {

  try {
    const body = await req.json();
    const { name, email, phone, groups } = body;

    // Validation
    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required." },
        { status: 400 }
      );
    }

    const existingTeacher = await prisma.teacher.findUnique({
      where: { email },
    });

    if (existingTeacher) {
      return NextResponse.json(
        { error: "Teacher already exists." },
        { status: 400 }
      );
    }

    const newTeacher = await prisma.teacher.create({
      data: {
        name,
        email,
        ...(phone && { phone }),
        groups: {
          create: groups.map(group => ({
            name: group.name,
            students: {
              create: group.students
            }
          }))
        }
      },
      include: {
        groups: {
          include: {
            students: true
          }
        }
      }
    });

    return NextResponse.json({ teacher: newTeacher }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/teachers/full:", error);
    return NextResponse.json(
      { error: "Something went wrong on the server." },
      { status: 500 }
    );
  }
})
