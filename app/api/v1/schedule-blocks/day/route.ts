import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/repositories/prisma";

function buildUtcDayRangeFromAppDay(day: string) {
  const start = new Date(`${day}T00:00:00.000Z`);
  const end = new Date(`${day}T23:59:59.999Z`);

  return { start, end };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const barbershopId = searchParams.get("barbershopId");
    const date = searchParams.get("date");

    if (!barbershopId || !date) {
      return NextResponse.json(
        {
          success: false,
          message: "barbershopId e date são obrigatórios.",
        },
        { status: 400 }
      );
    }

    const { start, end } = buildUtcDayRangeFromAppDay(date);

    const blocks = await db.scheduleBlock.findMany({
      where: {
        barbershopId,
        startDate: {
          lte: end,
        },
        endDate: {
          gte: start,
        },
      },
      orderBy: {
        startDate: "asc",
      },
      select: {
        id: true,
        barberId: true,
        startDate: true,
        endDate: true,
        reason: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: blocks,
    });
  } catch (error) {
    console.error("GET /api/v1/schedule-blocks/day ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}