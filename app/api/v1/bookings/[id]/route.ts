import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/repositories/prisma";
import { authenticate } from "@/app/lib/auth/middleware";
import { AppError } from "@/app/lib/errors/app-error";

interface Params {
  params: {
    id: string;
  };
}

export async function DELETE(
  request: NextRequest,
  { params }: Params
) {
  try {
    // 🔐 Retorna string (userId)
    const userId = authenticate(request);

    const booking = await db.booking.findUnique({
      where: { id: params.id },
    });

    if (!booking) {
      throw new AppError("Agendamento não encontrado", 404);
    }

    // 🔒 Segurança: só o dono pode cancelar
    if (booking.userId !== userId) {
      throw new AppError("Não autorizado", 403);
    }

    await db.booking.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "Agendamento cancelado com sucesso",
    });

  } catch (error) {
    console.error(error);

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