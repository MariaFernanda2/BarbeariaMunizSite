"use server";

import { db } from "@/app/lib/repositories/prisma";
import { revalidatePath } from "next/cache";
import { buildBookingEndDate } from "@/app/lib/utils/booking-time";

interface SaveBookingParams {
  barbershopId: string;
  serviceId: string;
  userId: string;
  date: Date;
  barberId: string;
}

export const saveBooking = async (params: SaveBookingParams) => {
  try {
    const service = await db.service.findUnique({
      where: {
        id: params.serviceId,
      },
    });

    if (!service) {
      throw new Error("Serviço não encontrado.");
    }

    const endDate = buildBookingEndDate(
      params.date,
      service.durationInMinutes
    );

    const conflictingBooking = await db.booking.findFirst({
      where: {
        barberId: params.barberId,
        status: {
          in: ["CONFIRMED", "COMPLETED"],
        },
        date: {
          lt: endDate,
        },
        endDate: {
          gt: params.date,
        },
      },
    });

    if (conflictingBooking) {
      throw new Error("Já existe um agendamento nesse intervalo.");
    }

    const conflictingBlock = await db.scheduleBlock.findFirst({
      where: {
        barberId: params.barberId,
        startDate: {
          lt: endDate,
        },
        endDate: {
          gt: params.date,
        },
      },
    });

    if (conflictingBlock) {
      throw new Error("Esse horário está dentro de um bloqueio de agenda.");
    }

    await db.booking.create({
      data: {
        serviceId: params.serviceId,
        userId: params.userId,
        date: params.date,
        endDate,
        barbershopId: params.barbershopId,
        barberId: params.barberId,
        status: "CONFIRMED",
      },
    });

    revalidatePath("/");
    revalidatePath("/bookings");
  } catch (error) {
    console.error("Erro ao salvar reserva:", error);
    throw error;
  }
};