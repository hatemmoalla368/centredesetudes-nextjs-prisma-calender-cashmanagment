import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '@/lib/auth';

const prisma = new PrismaClient();

export const GET = authMiddleware (async(request, { params })=> {
  try {
    console.log('Attempting to fetch revenue shares...');
    
    const revenueShares = await prisma.revenueShareAgreement.findMany({
      include: {
        teacher: true,
        student: true,
      },
    });
    
    console.log('Successfully fetched revenue shares:', revenueShares.length);
    return NextResponse.json(revenueShares);
    
  } catch (error) {
    console.error('Error in revenue-shares API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue shares', details: error.message },
      { status: 500 }
    );
  }
})

export const POST = authMiddleware (async(request, { params })=> {

  try {
    const {
      teacherId,
      studentId,
      totalAmount,
      centerShare,
      teacherShare,
      sessionsPerPayment,
      nextPaymentDate,
    } = await request.json();

    const revenueShare = await prisma.revenueShareAgreement.create({
      data: {
        teacherId: parseInt(teacherId),
        studentId: parseInt(studentId),
        totalAmount: parseFloat(totalAmount),
        centerShare: parseFloat(centerShare),
        teacherShare: parseFloat(teacherShare),
        sessionsPerPayment: parseInt(sessionsPerPayment),
        nextPaymentDate: new Date(nextPaymentDate),
      },
      include: {
        teacher: true,
        student: true,
      },
    });

    // Create the initial receivable transaction
    await prisma.transaction.create({
      data: {
        type: 'receivable',
        amount: parseFloat(totalAmount),
        description: `Accord de partage avec ${revenueShare.teacher.name} pour ${revenueShare.student.name}`,
        category: 'revenue_share',
        relatedTo: 'teacher',
        relatedId: parseInt(teacherId),
        status: 'pending',
        dueDate: new Date(nextPaymentDate),
      },
    });

    return NextResponse.json(revenueShare, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create revenue share agreement' },
      { status: 500 }
    );
  }
})