export interface UpdateBookingDTO {
  date?: string;
  status?: "CONFIRMED" | "COMPLETED" | "CANCELED";
}