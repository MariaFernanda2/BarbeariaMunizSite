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
    // 🔓 Aberto: Não precisa mais de authenticate(request)
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

export async function DELETE(
  request: NextRequest,
  { params }: Params
) {
  try {
    // 🔓 Aberto: Removido authenticate e verificações de user.id
    const service = new BookingService(
      new BookingRepository()
    );

    // Agora passamos apenas o ID do agendamento
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

  // Erro genérico para falhas inesperadas
  return NextResponse.json(
    { success: false, message: "Erro interno do servidor" },
    { status: 500 }
  );
}