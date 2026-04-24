export interface CreateBookingDTO {
  userId?: string;
  serviceId: string;
  barberId: string;
  barbershopId: string;
  date: string | Date;
  clientName?: string;
  clientPhone?: string;
  paymentMethod?: "CARD" | "CASH" | "PIX" | null;
  finalPrice?: number | null;
  status?: "CONFIRMED" | "COMPLETED" | "CANCELED";
}