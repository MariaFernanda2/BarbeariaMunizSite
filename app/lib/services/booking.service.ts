import { BookingStatus } from "@prisma/client";

import { CreateBookingDTO } from "../dtos/create-booking.dto";
import { BookingRepository } from "../repositories/booking.repository";
import { AppError } from "../errors/app-error";
import { BookingResponseDTO } from "../dtos/booking-response.dto";
import { UpdateBookingDTO } from "../dtos/update-booking.dto";
import { db } from "../repositories/prisma";
import { buildBookingEndDate } from "../utils/booking-time";

interface CreateBookingOptions {
  allowPastDate?: boolean;
}

interface UpdateBookingOptions {
  allowPastDate?: boolean;
}

export class BookingService {
  private bookingRepository: BookingRepository;

  constructor(bookingRepository?: BookingRepository) {
    this.bookingRepository = bookingRepository || new BookingRepository();
  }

  async create(
    data: CreateBookingDTO,
    options?: CreateBookingOptions,
  ): Promise<BookingResponseDTO> {
    const bookingDate = new Date(data.date);
    const allowPastDate = options?.allowPastDate ?? false;

    if (isNaN(bookingDate.getTime())) {
      throw new AppError("Data inválida.", 400);
    }

    if (!allowPastDate && bookingDate <= new Date()) {
      throw new AppError("A data da reserva deve ser futura.", 400);
    }

    if (!data.barberId) {
      throw new AppError("Barbeiro é obrigatório.", 400);
    }

    if (!data.serviceId) {
      throw new AppError("Serviço é obrigatório.", 400);
    }

    if (!data.barbershopId) {
      throw new AppError("Barbearia é obrigatória.", 400);
    }

    if (!data.userId && !data.clientName) {
      throw new AppError("Informe o cliente.", 400);
    }

    const barber = await db.barber.findUnique({
      where: { id: data.barberId },
    });

    if (!barber) {
      throw new AppError("Barbeiro não encontrado.", 404);
    }

    if (String(barber.barbershopId) !== String(data.barbershopId)) {
      throw new AppError("O barbeiro não pertence a essa unidade.", 400);
    }

    const service = await db.service.findUnique({
      where: { id: data.serviceId },
    });

    if (!service) {
      throw new AppError("Serviço não encontrado.", 404);
    }

    if (String(service.barbershopId) !== String(data.barbershopId)) {
      throw new AppError("O serviço não pertence a essa unidade.", 400);
    }

    const bookingEndDate = buildBookingEndDate(
      bookingDate,
      service.durationInMinutes,
    );

    const conflictingBooking = await db.booking.findFirst({
      where: {
        barberId: data.barberId,
        status: {
          in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED],
        },
        date: {
          lt: bookingEndDate,
        },
        endDate: {
          gt: bookingDate,
        },
      },
    });

    if (conflictingBooking) {
      throw new AppError(
        "Já existe um agendamento em andamento nesse intervalo.",
        409,
      );
    }

    const conflictingBlock = await db.scheduleBlock.findFirst({
      where: {
        barberId: data.barberId,
        startDate: {
          lt: bookingEndDate,
        },
        endDate: {
          gt: bookingDate,
        },
      },
    });

    if (conflictingBlock) {
      throw new AppError("A agenda está bloqueada nesse intervalo.", 409);
    }

    let finalUserId = data.userId;

    if (!finalUserId && data.clientName) {
      const generatedEmail = `cliente-${Date.now()}@barbeariamuniz.local`;

      const createdUser = await db.user.create({
        data: {
          name: data.clientName,
          email: generatedEmail,
        },
      });

      finalUserId = createdUser.id;
    }

    if (!finalUserId) {
      throw new AppError("Cliente inválido.", 400);
    }

    const isCompleted = data.status === BookingStatus.COMPLETED;

    const booking = await this.bookingRepository.create({
      userId: finalUserId,
      serviceId: data.serviceId,
      barberId: data.barberId,
      barbershopId: data.barbershopId,
      date: bookingDate,
      endDate: bookingEndDate,
      clientName: data.clientName,
      clientPhone: data.clientPhone ?? null,
      status: data.status ?? BookingStatus.CONFIRMED,
      paymentMethod: data.paymentMethod ?? null,
      finalPrice: data.finalPrice ?? Number(service.price),
      paidAt: isCompleted ? new Date() : null,
    });

    return this.mapToResponse(booking);
  }

  async cancelBooking(id: string) {
    const booking = await this.bookingRepository.findById(id);

    if (!booking) {
      throw new AppError("Reserva não encontrada.", 404);
    }

    if (new Date(booking.date) <= new Date()) {
      throw new AppError(
        "Não é possível cancelar reserva finalizada ou em andamento.",
        400,
      );
    }

    return this.bookingRepository.delete(id);
  }

  async findByUser(userId: string): Promise<BookingResponseDTO[]> {
    const bookings = await this.bookingRepository.findByUser(userId);

    return bookings.map((booking) => this.mapToResponse(booking));
  }

  async findById(id: string): Promise<BookingResponseDTO> {
    const booking = await this.bookingRepository.findById(id);

    if (!booking) {
      throw new AppError("Reserva não encontrada.", 404);
    }

    return this.mapToResponse(booking);
  }

  async updateBooking(
    id: string,
    data: UpdateBookingDTO,
    options?: UpdateBookingOptions,
  ) {
    const existingBooking = await this.bookingRepository.findById(id);

    if (!existingBooking) {
      throw new AppError("Reserva não encontrada.", 404);
    }

    let nextDate = existingBooking.date;
    let nextServiceId = existingBooking.serviceId;
    const nextStatus = data.status ?? existingBooking.status;

    if (data.date) {
      const parsedDate = new Date(data.date);

      if (isNaN(parsedDate.getTime())) {
        throw new AppError("Data inválida.", 400);
      }

      nextDate = parsedDate;
    }

    if (data.serviceId) {
      nextServiceId = data.serviceId;
    }

    const service = await db.service.findUnique({
      where: { id: nextServiceId },
    });

    if (!service) {
      throw new AppError("Serviço não encontrado.", 404);
    }

    if (String(service.barbershopId) !== String(existingBooking.barbershopId)) {
      throw new AppError("O serviço não pertence a essa unidade.", 400);
    }

    const nextEndDate = buildBookingEndDate(
      nextDate,
      service.durationInMinutes,
    );

    const conflictingBooking = await db.booking.findFirst({
      where: {
        id: { not: id },
        barberId: existingBooking.barberId,
        status: {
          in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED],
        },
        date: {
          lt: nextEndDate,
        },
        endDate: {
          gt: nextDate,
        },
      },
    });

    if (conflictingBooking) {
      throw new AppError("Já existe outro agendamento nesse intervalo.", 409);
    }

    const conflictingBlock = await db.scheduleBlock.findFirst({
      where: {
        barberId: existingBooking.barberId,
        startDate: {
          lt: nextEndDate,
        },
        endDate: {
          gt: nextDate,
        },
      },
    });

    if (conflictingBlock) {
      throw new AppError("A agenda está bloqueada nesse intervalo.", 409);
    }

    const updatePayload: any = {
      date: nextDate,
      endDate: nextEndDate,
      serviceId: nextServiceId,

      ...(data.status && {
        status: nextStatus,
      }),

      ...(data.clientName !== undefined && {
        clientName: data.clientName,
      }),

      ...(data.clientPhone !== undefined && {
        clientPhone: data.clientPhone,
      }),

      ...(data.paymentMethod !== undefined && {
        paymentMethod: data.paymentMethod,
      }),

      ...(data.finalPrice !== undefined && {
        finalPrice: data.finalPrice,
      }),
    };

    if (nextStatus === BookingStatus.COMPLETED) {
      updatePayload.paidAt = existingBooking.paidAt ?? new Date();

      if (data.finalPrice === undefined || data.finalPrice === null) {
        updatePayload.finalPrice = Number(service.price ?? 0);
      }
    }

    if (nextStatus !== BookingStatus.COMPLETED) {
      updatePayload.paidAt = null;
    }

    const updated = await this.bookingRepository.update(id, updatePayload);

    return this.mapToResponse(updated);
  }

  private mapToResponse(booking: any): BookingResponseDTO {
    const finalPrice = booking.finalPrice ?? booking.service?.price ?? 0;

    return {
      id: booking.id,
      date: booking.date.toISOString(),
      endDate: booking.endDate?.toISOString(),
      status: booking.status,
      paymentMethod: booking.paymentMethod ?? null,
      finalPrice: booking.finalPrice ? Number(booking.finalPrice) : null,
      paidAt: booking.paidAt?.toISOString() ?? null,

      service: {
        id: booking.service.id,
        name: booking.service.name,
        price: Number(finalPrice),
        originalPrice: Number(booking.service.price),
      },

      barbershop: {
        id: booking.barbershop.id,
        name: booking.barbershop.name,
        imageUrl: booking.barbershop.imageUrl,
        address: booking.barbershop.address,
      },

      barber: {
        id: booking.barber.id,
        name: booking.barber.name,
        imageUrl: booking.barber.imageUrl,
      },

      user: {
        id: booking.user.id,
        name: booking.user.name,
        email: booking.user.email,
        image: booking.user.image,
      },
    };
  }
}
