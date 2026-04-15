export interface CreateBookingDTO {
  userId?: string;
  serviceId: string;
  barberId: string;
  barbershopId: string;
  date: string | Date;
  clientName?: string;
  clientPhone?: string;
}