export interface CreateBookingDTO {
  userId?: string;
  clientName?: string;
  serviceId: string;
  barberId: string;
  barbershopId: string;
  date: string | Date;
}