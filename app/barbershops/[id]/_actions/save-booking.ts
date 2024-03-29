"use server";

import { db } from "@/app/_lib/prisma";
import { revalidatePath } from "next/cache";

interface SaveBookingParams {
  barbershopId: string;
  serviceId: string;
  userId: string;
  date: Date;
  barberId: string;
}

export const saveBooking = async (params: SaveBookingParams) => {
  try {
    // Crie a reserva incluindo o barberId fornecido
    await db.booking.create({
      data: {
        serviceId: params.serviceId,
        userId: params.userId,
        date: params.date,
        barbershopId: params.barbershopId,
        barberId: params.barberId, 
      },
    });

    revalidatePath("/");
    revalidatePath("/bookings");
  } catch (error) {
    console.error("Erro ao salvar reserva:", error);
    throw error; 
  }
};