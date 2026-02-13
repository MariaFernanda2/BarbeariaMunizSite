import { NextRequest, NextResponse } from "next/server";
import { BarbershopService } from "@/app/lib/services/barbershop.service";
import { AppError } from "@/app/lib/errors/app-error";

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;

    const service = new BarbershopService();
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

    return NextResponse.json(
      {
        success: false,
        message: "Erro interno do servidor.",
      },
      { status: 500 }
    );
  }
}
