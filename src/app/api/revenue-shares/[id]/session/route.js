import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '@/lib/auth';

const prisma = new PrismaClient();

export const POST = authMiddleware (async(request, { params })=> {

  const { id } = params;

  try {
    // Find the agreement
    const agreement = await prisma.revenueShareAgreement.findUnique({
      where: { id: parseInt(id) },
    });

    if (!agreement) {
      return NextResponse.json(
        { error: 'Agreement not found' },
        { status: 404 }
      );
    }

    // Update the completed sessions
    const updatedSessions = agreement.completedSessions + 1;
    let nextPaymentDate = agreement.nextPaymentDate;
    let shouldProcessPayment = false;

    // Check if we've reached the payment threshold
    if (updatedSessions % agreement.sessionsPerPayment === 0) {
      shouldProcessPayment = true;
      // Set next payment date to 4 sessions from now (or your logic)
      const date = new Date();
      date.setDate(date.getDate() + (agreement.sessionsPerPayment * 7)); // Assuming weekly sessions
      nextPaymentDate = date;
    }

    // Update the agreement
    const updatedAgreement = await prisma.revenueShareAgreement.update({
      where: { id: parseInt(id) },
      data: {
        completedSessions: updatedSessions,
        nextPaymentDate: shouldProcessPayment ? nextPaymentDate : agreement.nextPaymentDate,
      },
      include: {
        teacher: true,
        student: true,
      },
    });

    // If it's time to process payment, create the transactions
    if (shouldProcessPayment) {
      // Create income transaction for the center's share
      await prisma.transaction.create({
        data: {
          type: 'income',
          amount: agreement.centerShare,
          description: `Part du centre de l'accord avec ${updatedAgreement.teacher.name} pour ${updatedAgreement.student.name}`,
          category: 'revenue_share',
          relatedTo: 'teacher',
          relatedId: agreement.teacherId,
          status: 'completed',
        },
      });

      // Create expense transaction for the teacher's share
      await prisma.transaction.create({
        data: {
          type: 'expense',
          amount: agreement.teacherShare,
          description: `Part de l'enseignant ${updatedAgreement.teacher.name} pour ${updatedAgreement.student.name}`,
          category: 'revenue_share',
          relatedTo: 'teacher',
          relatedId: agreement.teacherId,
          status: 'completed',
        },
      });

      // Update the receivable transaction
      await prisma.transaction.updateMany({
        where: {
          description: `Accord de partage avec ${updatedAgreement.teacher.name} pour ${updatedAgreement.student.name}`,
          status: 'pending',
        },
        data: {
          status: 'completed',
        },
      });

      // Create a new receivable for the next period
      await prisma.transaction.create({
        data: {
          type: 'receivable',
          amount: agreement.totalAmount,
          description: `Accord de partage avec ${updatedAgreement.teacher.name} pour ${updatedAgreement.student.name}`,
          category: 'revenue_share',
          relatedTo: 'teacher',
          relatedId: agreement.teacherId,
          status: 'pending',
          dueDate: nextPaymentDate,
        },
      });
    }

    return NextResponse.json(updatedAgreement);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to record session' },
      { status: 500 }
    );
  }
})