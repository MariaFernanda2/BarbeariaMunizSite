import { CreateBookingDTO } from "../dtos/create-booking.dto";
import { BookingRepository } from "../repositories/booking.repository";
import { AppError } from "../errors/app-error";
import { BookingResponseDTO } from "../dtos/booking-response.dto";

export class BookingService {
  private bookingRepository: BookingRepository;

  constructor() {
    this.bookingRepository = new BookingRepository();
  }

  async create(data: CreateBookingDTO): Promise<BookingResponseDTO> {
    const bookingDate = new Date(data.date);

    if (bookingDate <= new Date()) {
      throw new AppError("A data da reserva deve ser futura.", 400);
    }

    const existingBooking =
      await this.bookingRepository.findByDateAndBarber(
        bookingDate,
        data.barberId
      );

    if (existingBooking) {
      throw new AppError("Horário já está reservado.", 409);
    }

    const booking = await this.bookingRepository.create(data);

    return this.mapToResponse(booking);
  }

  async cancel(id: string) {
    const booking = await this.bookingRepository.findById(id);

    if (!booking) {
      throw new AppError("Reserva não encontrada.", 404);
    }

    if (booking.date <= new Date()) {
      throw new AppError("Não é possível cancelar reserva finalizada.", 400);
    }

    return this.bookingRepository.delete(id);
  }

  async findByUser(userId: string): Promise<BookingResponseDTO[]> {
    const bookings = await this.bookingRepository.findByUser(userId);

    return bookings.map((booking) => this.mapToResponse(booking));
  }

  private mapToResponse(booking: any): BookingResponseDTO {
    return {
      id: booking.id,
      date: booking.date.toISOString(),
      service: {
        id: booking.service.id,
        name: booking.service.name,
        price: Number(booking.service.price),
      },
      barbershop: {
        id: booking.barbershop.id,
        name: booking.barbershop.name,
        imageUrl: booking.barbershop.imageUrl,
        address: booking.barbershop.address,
      },
    };
  }
}
