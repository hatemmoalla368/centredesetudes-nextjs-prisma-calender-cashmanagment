import { NextResponse } from "next/server"; // Import NextResponse
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "@/lib/auth";

const prisma = new PrismaClient();
// Handler for PUT (Update) and DELETE (Delete) requests for a specific schedule


export const DELETE = authMiddleware (async(request, { params })=> {
  try {
    const { id } = params; // Extract schedule ID from the URL params

    // Delete the schedule by its ID
    const deletedtransaction = await prisma.transaction.delete({
      where: { id: parseInt(id) }, // Delete schedule using ID
    });

    // Return the deleted schedule data
    return NextResponse.json(deletedtransaction, { status: 200 });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return NextResponse.json({ message: "Failed to delete transaction" }, { status: 500 });
  }
})
export const PUT = authMiddleware (async(request, { params })=> {
  try {
    const { id } = params
    const data = await request.json()

    // Validate ID exists
    if (!id) {
      return new Response(JSON.stringify({ error: 'Transaction ID is required' }), {
        status: 400
      })
    }

    // Convert string IDs to numbers
    const updateData = {
      type: data.type,
      amount: parseFloat(data.amount),
      description: data.description,
      status: data.status,
      category: data.category || 'other',
      date: data.date ? new Date(data.date) : new Date(),
      teacherId: data.teacherId ? parseInt(data.teacherId) : null,
      studentId: data.studentId ? parseInt(data.studentId) : null,
      groupId: data.groupId ? parseInt(data.groupId) : null
    }

    // THIS IS THE CRITICAL PART - MUST USE update()
    const updatedTransaction = await prisma.transaction.update({
      where: { id: parseInt(id) },  // Specify which record to update
      data: updateData             // New data to apply
    })

    return new Response(JSON.stringify(updatedTransaction), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error updating transaction:', error)
    return new Response(JSON.stringify({ error: 'Failed to update transaction' }), {
      status: 500
    })
  }
})