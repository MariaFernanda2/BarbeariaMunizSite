export interface BookingResponseDTO {
  id: string;
  date: string;
  status: "CONFIRMED" | "COMPLETED" | "CANCELED";

  service: {
    id: string;
    name: string;
    price: number;
  };

  barbershop: {
    id: string;
    name: string;
    imageUrl: string;
    address: string;
  };

  barber: {
    id: string;
    name: string;
    imageUrl: string;
  };

  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
}
