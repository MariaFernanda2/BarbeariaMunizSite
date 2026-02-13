import { NextRequest, NextResponse } from "next/server";
import { BarbershopRepository } from "@/app/lib/repositories/barbershop.repository";
import { BarbershopService } from "@/app/lib/services/barbershop.service";
import { AppError } from "@/app/lib/errors/app-error";
import { authenticate } from "@/app/lib/auth/middleware";

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
    // 🔐 Autenticação via Bearer Token
    const user = authenticate(request);

    const service = new BarbershopService(
      new BarbershopRepository()
    );

    const barbershop = await service.findById(params.id);

    return NextResponse.json({
      success: true,
      data: barbershop,
      requestedBy: user, // opcional (para debug)
    });

  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.statusCode }
      );
    }

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
