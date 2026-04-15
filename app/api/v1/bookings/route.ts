import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/lib/auth";
import { BookingService } from "@/app/lib/services/booking.service";
import { AppError } from "@/app/lib/errors/app-error";
import { db } from "@/app/lib/repositories/prisma";

type SessionUser = {
  id: string;
  role: "USER" | "BARBER" | "ADMIN";
  barbershopId?: string | number | null;
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Você precisa estar logado." },
        { status: 401 }
      );
    }

    const sessionUser = session.user as SessionUser;
    const {
      id: sessionUserId,
      role,
      barbershopId: sessionBarbershopId,
    } = sessionUser;

    const body = await request.json();

    const {
      userId,
      clientName,
      clientPhone,
      serviceId,
      barberId,
      barbershopId,
      date,
    } = body;

    if (!serviceId || !barberId || !barbershopId || !date) {
      return NextResponse.json(
        { success: false, message: "Parâmetros inválidos." },
        { status: 400 }
      );
    }

    const selectedBarber = await db.barber.findUnique({
      where: { id: barberId },
    });

    if (!selectedBarber) {
      return NextResponse.json(
        { success: false, message: "Barbeiro não encontrado." },
        { status: 404 }
      );
    }

    if (String(selectedBarber.barbershopId) !== String(barbershopId)) {
      return NextResponse.json(
        {
          success: false,
          message: "O barbeiro selecionado não pertence a essa unidade.",
        },
        { status: 400 }
      );
    }

    let bookingPayload: {
      userId?: string;
      clientName?: string;
      clientPhone?: string;
      serviceId: string;
      barberId: string;
      barbershopId: string;
      date: string;
    };

    if (role === "USER") {
      if (!clientName || !clientPhone) {
        return NextResponse.json(
          {
            success: false,
            message: "Informe seu nome e WhatsApp.",
          },
          { status: 400 }
        );
      }

      bookingPayload = {
        userId: sessionUserId,
        clientName,
        clientPhone,
        serviceId,
        barberId,
        barbershopId,
        date,
      };
    } else if (role === "BARBER") {
      if (String(sessionBarbershopId) !== String(barbershopId)) {
        return NextResponse.json(
          { success: false, message: "Sem acesso a essa unidade." },
          { status: 403 }
        );
      }

      if (
        String(selectedBarber.barbershopId) !== String(sessionBarbershopId)
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Você só pode criar agendamentos para barbeiros da sua unidade.",
          },
          { status: 403 }
        );
      }

      if (!userId && !clientName) {
        return NextResponse.json(
          { success: false, message: "Informe o cliente." },
          { status: 400 }
        );
      }

      bookingPayload = {
        userId,
        clientName,
        clientPhone,
        serviceId,
        barberId,
        barbershopId,
        date,
      };
    } else if (role === "ADMIN") {
      if (!userId && !clientName) {
        return NextResponse.json(
          { success: false, message: "Informe o cliente." },
          { status: 400 }
        );
      }

      bookingPayload = {
        userId,
        clientName,
        clientPhone,
        serviceId,
        barberId,
        barbershopId,
        date,
      };
    } else {
      return NextResponse.json(
        { success: false, message: "Acesso negado." },
        { status: 403 }
      );
    }

    const bookingService = new BookingService();
    const booking = await bookingService.create(bookingPayload);

    return NextResponse.json(
      { success: true, data: booking },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.statusCode }
      );
    }

    console.error("POST /bookings ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}