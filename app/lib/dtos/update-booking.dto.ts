export interface UpdateBookingDTO {
  date?: string;
  status?: "CONFIRMED" | "COMPLETED" | "CANCELED";
  userId?: string;
  clientName?: string;
  clientPhone?: string;
  paymentMethod?: "CARD" | "CASH" | "PIX" | null;
  finalPrice?: number | null;
}