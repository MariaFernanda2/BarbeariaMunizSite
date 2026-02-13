export interface BarbershopDetailsResponseDTO {
  id: string;
  name: string;
  address: string;
  imageUrl: string;
  services: {
    id: string;
    name: string;
    price: number;
  }[];
  barbers: {
    id: string;
    name: string;
  }[];
}
