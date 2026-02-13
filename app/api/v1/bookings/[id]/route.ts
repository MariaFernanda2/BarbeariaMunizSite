import { NextResponse } from "next/server";
import { BarbershopRepository } from "@/app/lib/repositories/barbershop.repository";
import { BarbershopService } from "@/app/lib/services/barbershop.service";
import { AppError } from "@/app/lib/errors/app-error";

interface Params {
  params: {
    id: string;
  };
}

export async function GET(
  req: Request,
  { params }: Params
) {
  const service = new BarbershopService(
    new BarbershopRepository()
  );

  try {
    const barbershop = await service.findById(params.id);

    return NextResponse.json({
      success: true,
      data: barbershop,
    });
  } catch (error) {
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
}
