import { NextRequest, NextResponse } from "next/server";
import { BarbershopRepository } from "@/app/lib/repositories/barbershop.repository";
import { BarbershopService } from "@/app/lib/services/barbershop.service";
import { BookingRepository } from "@/app/lib/repositories/booking.repository";
import { BookingService } from "@/app/lib/services/booking.service";
import { AppError } from "@/app/lib/errors/app-error";
import { authenticate } from "@/app/lib/auth/middleware";

// Interface para resolver o erro "Property id does not exist"
interface AuthUser {
  id: string;
  name?: string;
  email?: string;
}

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
    // Casting para AuthUser
    const user = authenticate(request) as AuthUser;

    const service = new BarbershopService(
      new BarbershopRepository()
    );

    const barbershop = await service.findById(params.id);

    return NextResponse.json({
      success: true,
      data: barbershop,
      requestedBy: user,
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
    // Casting para AuthUser resolve o erro de tipagem no user.id
    const user = authenticate(request) as AuthUser;

    const service = new BookingService(
      new BookingRepository()
    );

    // Agora o TypeScript reconhece o 'id'
    await service.cancelBooking(params.id, user.id);

    return NextResponse.json({
      success: true,
      message: "Agendamento cancelado com sucesso",
    });
  } catch (error) {
    console.error("Erro no cancelamento:", error);
    return handleError(error);
  }
}

// Função auxiliar para evitar repetição de código nos catches
function handleError(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: error.statusCode }
    );
  }

  if (error instanceof Error && error.message === "Unauthorized") {
    return NextResponse.json(
      { success: false, message: "Token inválido ou ausente" },
      { status: 401 }
    );
  }

  return NextResponse.json(
    { success: false, message: "Erro interno do servidor" },
    { status: 500 }
  );
}