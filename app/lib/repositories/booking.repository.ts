import { db } from "./prisma";

export class BookingRepository {
  async create(data: {
    userId: string;
    serviceId: string;
    barberId: string;
    barbershopId: string;
    date: Date;
    clientName?: string;
    clientPhone?: string;
  }) {
    return db.booking.create({
      data: {
        userId: data.userId,
        serviceId: data.serviceId,
        barberId: data.barberId,
        barbershopId: data.barbershopId,
        date: data.date,
        clientName: data.clientName,
        clientPhone: data.clientPhone,
        status: "CONFIRMED",
      },
      include: {
        service: true,
        barbershop: true,
        barber: true,
        user: true,
      },
    });
  }

  async findByDateAndBarber(date: Date, barberId: string) {
    return db.booking.findFirst({
      where: {
        barberId,
        date,
        status: {
          not: "CANCELED",
        },
      },
    });
  }

  async findById(id: string) {
    return db.booking.findUnique({
      where: { id },
      include: {
        service: true,
        barbershop: true,
        barber: true,
        user: true,
      },
    });
  }

  async findByUser(userId: string) {
    return db.booking.findMany({
      where: { userId },
      include: {
        service: true,
        barbershop: true,
        barber: true,
        user: true,
      },
      orderBy: {
        date: "desc",
      },
    });
  }

  async update(
    id: string,
    data: {
      date?: Date;
      status?: "CONFIRMED" | "COMPLETED" | "CANCELED";
    }
  ) {
    return db.booking.update({
      where: { id },
      data,
      include: {
        service: true,
        barbershop: true,
        barber: true,
        user: true,
      },
    });
  }

  async delete(id: string) {
    return db.booking.update({
      where: { id },
      data: {
        status: "CANCELED",
      },
    });
  }
}