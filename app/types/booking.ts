export interface Booking {
  id: string;
  date: string;
  barberId: string;
}

export interface Barber {
  id: string;
  name: string;
}

export interface Service {
  id: string;
  name: string;
  price: number;
}

export interface Barbershop {
  id: string;
  name: string;
}
