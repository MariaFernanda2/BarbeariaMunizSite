import { BookingStatus, PaymentMethod } from "@prisma/client";
import { db } from "./prisma";

export class BookingRepository {
  async create(data: {
    userId: string;
    serviceId: string;
    barberId: string;
    barbershopId: string;
    date: Date;
    endDate: Date;
    clientName?: string | null;
    clientPhone?: string | null;
    status?: BookingStatus;
    paymentMethod?: PaymentMethod | null;
    finalPrice?: number | null;
    paidAt?: Date | null;
  }) {
    return db.booking.create({
      data: {
        userId: data.userId,
        serviceId: data.serviceId,
        barberId: data.barberId,
        barbershopId: data.barbershopId,
        date: data.date,
        endDate: data.endDate,
        clientName: data.clientName,
        clientPhone: data.clientPhone,
        status: data.status ?? BookingStatus.CONFIRMED,
        paymentMethod: data.paymentMethod ?? null,
        finalPrice: data.finalPrice ?? null,
        paidAt: data.paidAt ?? null,
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
          not: BookingStatus.CANCELED,
        },
      },
      include: {
        service: true,
        barbershop: true,
        barber: true,
        user: true,
      },
    });
  }

  async findConflictingBooking(params: {
    barberId: string;
    startDate: Date;
    endDate: Date;
    excludeBookingId?: string;
  }) {
    return db.booking.findFirst({
      where: {
        barberId: params.barberId,
        ...(params.excludeBookingId
          ? {
              id: {
                not: params.excludeBookingId,
              },
            }
          : {}),
        status: {
          in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED],
        },
        date: {
          lt: params.endDate,
        },
        endDate: {
          gt: params.startDate,
        },
      },
      include: {
        service: true,
        barbershop: true,
        barber: true,
        user: true,
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
      endDate?: Date;
      status?: BookingStatus;
      clientName?: string | null;
      clientPhone?: string | null;
      paymentMethod?: PaymentMethod | null;
      finalPrice?: number | null;
      paidAt?: Date | null;
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
        status: BookingStatus.CANCELED,
      },
      include: {
        service: true,
        barbershop: true,
        barber: true,
        user: true,
      },
    });
  }
}