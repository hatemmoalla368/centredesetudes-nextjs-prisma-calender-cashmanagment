import { NextResponse } from "next/server"; // Import NextResponse
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
// Handler for PUT (Update) and DELETE (Delete) requests for a specific schedule


export async function DELETE(req, { params }) {
  try {
    const { id } = params; // Extract schedule ID from the URL params

    // Delete the schedule by its ID
    const deletedtransaction = await prisma.transactions.delete({
      where: { id: parseInt(id) }, // Delete schedule using ID
    });

    // Return the deleted schedule data
    return NextResponse.json(deletedtransaction, { status: 200 });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return NextResponse.json({ message: "Failed to delete transaction" }, { status: 500 });
  }
}