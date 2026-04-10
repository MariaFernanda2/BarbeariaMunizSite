import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { db } from "@/app/lib/repositories/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Você precisa estar logado." },
        { status: 401 }
      );
    }

    if (session.user.role !== "BARBER") {
      return NextResponse.json(
        { success: false, message: "Acesso negado." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { barberId, barbershopId, startDate, endDate, reason } = body;

    if (!barberId || !barbershopId || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, message: "Preencha os campos obrigatórios." },
        { status: 400 }
      );
    }

    if (String(session.user.barbershopId) !== String(barbershopId)) {
      return NextResponse.json(
        { success: false, message: "Sem acesso a essa unidade." },
        { status: 403 }
      );
    }

    const barber = await db.barber.findUnique({
      where: { id: barberId },
    });

    if (!barber) {
      return NextResponse.json(
        { success: false, message: "Barbeiro não encontrado." },
        { status: 404 }
      );
    }

    if (String(barber.barbershopId) !== String(session.user.barbershopId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Você só pode bloquear agenda de barbeiros da sua unidade.",
        },
        { status: 403 }
      );
    }

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
      return NextResponse.json(
        { success: false, message: "Datas inválidas." },
        { status: 400 }
      );
    }

    if (parsedEndDate <= parsedStartDate) {
      return NextResponse.json(
        {
          success: false,
          message: "O fim do bloqueio deve ser maior que o início.",
        },
        { status: 400 }
      );
    }

    const conflictingBlock = await db.scheduleBlock.findFirst({
      where: {
        barberId,
        AND: [
          { startDate: { lt: parsedEndDate } },
          { endDate: { gt: parsedStartDate } },
        ],
      },
    });

    if (conflictingBlock) {
      return NextResponse.json(
        {
          success: false,
          message: "Já existe um bloqueio conflitante nesse período.",
        },
        { status: 409 }
      );
    }

    const scheduleBlock = await db.scheduleBlock.create({
      data: {
        barberId,
        barbershopId,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        reason: reason?.trim() || null,
      },
      include: {
        barber: true,
        barbershop: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Bloqueio de agenda criado com sucesso.",
        data: scheduleBlock,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/v1/schedule-blocks ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}