export interface BookingResponseDTO {
  id: string;
  date: string;
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
}
