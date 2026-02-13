import { NextRequest, NextResponse } from "next/server";
import { BarbershopService } from "@/app/lib/services/barbershop.service";
import { BarbershopRepository } from "@/app/lib/repositories/barbershop.repository";
import { AppError } from "@/app/lib/errors/app-error";

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;

    // 1️⃣ Cria a instância do repositório
    const repository = new BarbershopRepository();

    // 2️⃣ Passa o repositório para o serviço
    const service = new BarbershopService(repository);

    // 3️⃣ Busca a barbearia
    const barbershop = await service.findById(id);

    return NextResponse.json(
      {
        success: true,
        data: barbershop,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: error.statusCode }
      );
    }

    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: "Erro interno do servidor.",
      },
      { status: 500 }
    );
  }
}
