import { db } from "@/app/lib/repositories/prisma";

export class BookingRepository {
  async create(data: any) {
    return db.booking.create({
      data: {
        date: new Date(data.date),

        // Conecta usuário existente ou cria
        user: {
          connectOrCreate: {
            where: { id: data.userId },
            create: {
              id: data.userId,
              name: data.userName || "Usuário do Google",
              email: data.userEmail || "",
            },
          },
        },

        // Conecta relações obrigatórias
        barber: { connect: { id: data.barberId } },
        barbershop: { connect: { id: data.barbershopId } },
        service: { connect: { id: data.serviceId } },
      },
      include: {
        service: true,
        barbershop: true,
      },
    });
  }

  async findById(id: string) {
    return db.booking.findUnique({
      where: { id },
      include: { service: true, barbershop: true },
    });
  }

  async delete(id: string) {
    return db.booking.delete({
      where: { id },
    });
  }

  async findByDateAndBarber(date: Date, barberId: string) {
    return db.booking.findFirst({
      where: {
        date,
        barberId,
      },
    });
  }

  async findByUser(userId: string) {
    return db.booking.findMany({
      where: { userId },
      include: {
        service: true,
        barbershop: true,
      },
      orderBy: {
        date: "desc",
      },
    });
  }
}
