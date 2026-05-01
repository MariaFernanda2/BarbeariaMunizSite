import { BookingStatus, PaymentMethod } from "@prisma/client";
import { db } from "./prisma";

const bookingInclude = {
  service: true,
  barbershop: true,
  barber: true,
  user: true,
};

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
        clientName: data.clientName ?? null,
        clientPhone: data.clientPhone ?? null,
        status: data.status ?? BookingStatus.CONFIRMED,
        paymentMethod: data.paymentMethod ?? null,
        finalPrice: data.finalPrice ?? null,
        paidAt: data.paidAt ?? null,
      },
      include: bookingInclude,
    });
  }

async findById(id: string) {
  return db.booking.findUnique({
    where: { id },
    include: bookingInclude,
  });
}

  async findByUser(userId: string) {
    return db.booking.findMany({
      where: { userId },
      include: bookingInclude,
      orderBy: {
        date: "desc",
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
      include: bookingInclude,
    });
  }

  async findServiceById(serviceId: string) {
    return db.service.findUnique({
      where: {
        id: serviceId,
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
      include: bookingInclude,
    });
  }

  async findConflictingBlock(params: {
    barberId: string;
    startDate: Date;
    endDate: Date;
  }) {
    return db.scheduleBlock.findFirst({
      where: {
        barberId: params.barberId,
        startDate: {
          lt: params.endDate,
        },
        endDate: {
          gt: params.startDate,
        },
      },
    });
  }

  async hasConflict(params: {
    barberId: string;
    startDate: Date;
    endDate: Date;
    excludeBookingId?: string;
  }) {
    const conflictingBooking = await this.findConflictingBooking(params);

    if (conflictingBooking) {
      return true;
    }

    const conflictingBlock = await this.findConflictingBlock({
      barberId: params.barberId,
      startDate: params.startDate,
      endDate: params.endDate,
    });

    return !!conflictingBlock;
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
      serviceId?: string;
    }
  ) {
    return db.booking.update({
      where: { id },
      data,
      include: bookingInclude,
    });
  }

  async delete(id: string) {
    return db.booking.update({
      where: { id },
      data: {
        status: BookingStatus.CANCELED,
        paidAt: null,
      },
      include: bookingInclude,
    });
  }
}