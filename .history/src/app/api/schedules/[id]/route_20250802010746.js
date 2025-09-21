// src/app/api/schedules/[id]/route.js
export const PUT = authMiddleware(async (request, { params }) => {
  try {
    const { id } = params;
    const body = await request.json();
    
    console.log('Received update data:', body); // Debug log

    // More flexible parsing
    const parsed = scheduleSchema.safeParse({
      ...body,
      classroomId: String(body.classroomId), // Ensure string
      teacherId: body.teacherId ? String(body.teacherId) : undefined,
    });

    if (!parsed.success) {
      console.error('Validation error:', parsed.error);
      return NextResponse.json({ error: parsed.error.errors }, { status: 400 });
    }

    const { classroomId, teacherId, startTime, endTime, description, recurringWeekly } = parsed.data;

    // Additional validation
    if (new Date(endTime) <= new Date(startTime)) {
      return NextResponse.json({ error: 'End time must be after start time' }, { status: 400 });
    }

    // Validate classroom exists
    const classroom = await prisma.classroom.findUnique({ 
      where: { id: parseInt(classroomId) } 
    });
    if (!classroom) {
      return NextResponse.json({ error: 'Classroom not found' }, { status: 404 });
    }

    // Validate teacher exists if provided
    if (teacherId) {
      const teacher = await prisma.teacher.findUnique({ 
        where: { id: parseInt(teacherId) } 
      });
      if (!teacher) {
        return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
      }
    }

    const updatedSchedule = await prisma.schedule.update({
      where: { id: parseInt(id) },
      data: {
        classroomId: parseInt(classroomId),
        teacherId: teacherId ? parseInt(teacherId) : null,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        description: description || null,
        recurringWeekly,
      },
      include: { classroom: true, teacher: true },
    });

    return NextResponse.json(updatedSchedule, { status: 200 });
  } catch (error) {
    console.error('Error updating schedule:', error);
    return NextResponse.json(
      { error: 'Failed to update schedule', details: error.message },
      { status: 500 }
    );
  }
});