import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Fetch transactions (with optional filters)
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // "income" or "expense"
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build the query filters
    const filters = {};
    if (type) filters.type = type;
    if (startDate && endDate) {
      filters.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    // Fetch transactions
    const transactions = await prisma.transaction.findMany({
      where: filters,
      orderBy: { date: "desc" }, // Sort by date (newest first)
    });

    return NextResponse.json(transactions, { status: 200 });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json({ error: "Failed to fetch transactions." }, { status: 500 });
  }
}

// POST: Add a new transaction
export async function POST(req) {
  try {
    const { type, amount, description, category, date } = await req.json();

    // Validate input
    if (!type || !amount || !description || !category) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    // Create the transaction
    const newTransaction = await prisma.transaction.create({
      data: {
        type,
        amount: parseFloat(amount),
        description,
        category,
        date: new Date(transaction.date)
      },
    });
console.log()
    return NextResponse.json(newTransaction, { status: 201 });
  } catch (error) {
    console.error("Error adding transaction:", error);
    return NextResponse.json({ error: "Failed to add transaction." }, { status: 500 });
  }
}