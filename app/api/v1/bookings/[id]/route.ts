import { NextRequest, NextResponse } from "next/server";
import { BarbershopRepository } from "@/app/lib/repositories/barbershop.repository";
import { BarbershopService } from "@/app/lib/services/barbershop.service";
import { BookingRepository } from "@/app/lib/repositories/booking.repository";
import { BookingService } from "@/app/lib/services/booking.service";
import { AppError } from "@/app/lib/errors/app-error";

interface Params {
  params: {
    id: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: Params
) {
  try {
    const service = new BarbershopService(
      new BarbershopRepository()
    );

    const barbershop = await service.findById(params.id);

    return NextResponse.json({
      success: true,
      data: barbershop,
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
      status: body.status,
      clientName: body.clientName,
      clientPhone: body.clientPhone,
      paymentMethod: body.paymentMethod,
      finalPrice: body.finalPrice,
    });

    return NextResponse.json({
      success: true,
      message: "Agendamento atualizado com sucesso",
      data: updatedBooking,
    });
  } catch (error) {
    return handleError(error);
  }
} // ✅ FECHOU O PATCH AQUI

export async function DELETE(
  request: NextRequest,
  { params }: Params
) {
  try {
    const service = new BookingService(
      new BookingRepository()
    );

    await service.cancelBooking(params.id);

    return NextResponse.json({
      success: true,
      message: "Agendamento cancelado com sucesso",
    });
  } catch (error) {
    console.error("Erro no cancelamento:", error);
    return handleError(error);
  }
}

function handleError(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: error.statusCode }
    );
  }

  return NextResponse.json(
    { success: false, message: "Erro interno do servidor" },
    { status: 500 }
  );
}