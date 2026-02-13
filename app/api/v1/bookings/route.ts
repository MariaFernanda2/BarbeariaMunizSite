import { NextRequest, NextResponse } from "next/server";
import { BookingService } from "@/app/lib/services/booking.service";
import { AppError } from "@/app/lib/errors/app-error";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { userId, serviceId, barberId, date } = body;

    if (!userId || !serviceId || !barberId || !date) {
      return NextResponse.json(
        { success: false, message: "Parâmetros inválidos" },
        { status: 400 }
      );
    }

    const bookingService = new BookingService();

    const booking = await bookingService.create(body);

    return NextResponse.json({ success: true, data: booking }, { status: 201 });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.statusCode }
      );
    }

    console.error("POST /bookings ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}

