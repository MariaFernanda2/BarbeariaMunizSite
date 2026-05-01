import { NextRequest, NextResponse } from "next/server";
import { BookingRepository } from "@/app/lib/repositories/booking.repository";
import { BookingService } from "@/app/lib/services/booking.service";
import { AppError } from "@/app/lib/errors/app-error";

interface Params {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const service = new BookingService(new BookingRepository());

    const booking = await service.findById(params.id);

    return NextResponse.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const body = await request.json();

    const service = new BookingService(new BookingRepository());

    const updatedBooking = await service.updateBooking(params.id, {
      date: body.date,
      endDate: body.endDate,
      status: body.status,
      clientName: body.clientName,
      clientPhone: body.clientPhone,
      paymentMethod: body.paymentMethod,
      finalPrice: body.finalPrice,
      serviceId: body.serviceId,
      paidAt: body.paidAt,
    });

    return NextResponse.json({
      success: true,
      message: "Agendamento atualizado com sucesso",
      data: updatedBooking,
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const service = new BookingService(new BookingRepository());

    await service.cancelBooking(params.id);

    return NextResponse.json({
      success: true,
      message: "Agendamento cancelado com sucesso",
    });
  } catch (error) {
    return handleError(error);
  }
}

function handleError(error: unknown) {
  console.error("Erro na API de agendamento:", error);

  if (error instanceof AppError) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: error.statusCode },
    );
  }
   if (error instanceof Error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { success: false, message: "Erro interno do servidor" },
    { status: 500 },
  );
}
