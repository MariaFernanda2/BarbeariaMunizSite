import { db } from "../_lib/prisma";

export const getLastCompletedBooking = async (userId: string) => {
  // Busca o agendamento mais recente onde a data está no passado (concluído)
  const lastBooking = await db.booking.findFirst({
    where: {
      userId: userId,
      date: {
        lt: new Date(), // Data menor que a atual (passado = concluído)
      },
    },
    include: {
      barber: true,
      service: true,
      barbershop: true,
    },
    orderBy: {
      date: "desc", // O mais recente primeiro
    },
  });

  // Retornamos o agendamento completo (ou null se não houver)
  return lastBooking;
};