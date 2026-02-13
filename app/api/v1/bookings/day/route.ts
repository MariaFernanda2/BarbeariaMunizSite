import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/repositories/prisma";
import { startOfDay, endOfDay } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const barbershopId = searchParams.get("barbershopId");
    const dateParam = searchParams.get("date");

    if (!barbershopId || !dateParam) {
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 }
      );
    }

    const date = new Date(dateParam);

    const bookings = await db.booking.findMany({
      where: {
        barbershopId,
        date: {
          gte: startOfDay(date),
          lte: endOfDay(date),
        },
      },
    });

    // 🔥 IMPORTANTE: retornar array direto
    return NextResponse.json(bookings);
  } catch (error) {
    console.error("DAY BOOKINGS ERROR:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
