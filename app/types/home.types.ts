import type { LucideIcon } from "lucide-react";

export type SessionUser = {
  id?: string;
  name?: string | null;
  role?: "USER" | "BARBER" | "ADMIN";
  barbershopId?: string | null;
  barberId?: string | null;
};

export type HomeData = {
  recommendedBarbershops: BarbershopSummary[];
  confirmedBookings: BookingSummary[];
  lastCompletedBooking: BookingSummary | null;
  carouselItems: CarouselItem[];
};

export type BarberHeroStats = {
  todayBookings: number;
  completedToday: number;
  monthClients: number;
  growthPercent: number;
};

export type BarberMetric = {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
};

export type BarberAction = {
  title: string;
  description: string;
  href: string;
  cta: string;
  icon: LucideIcon;
  tone?: "primary" | "secondary";
};

export type BarberPerformance = {
  topService: string;
  recurringClients: number;
  todayBlocks: number;
};

export type BarberDashboardData = {
  heroStats: BarberHeroStats;
  metrics: BarberMetric[];
  actions: BarberAction[];
  performance: BarberPerformance;
};

export type BarbershopSummary = {
  id: string;
  name: string;
  address: string;
  imageUrl: string;
};

export type BookingSummary = {
  id: string;
  date: string;
  status: "CONFIRMED" | "COMPLETED" | "CANCELED";
  service: {
    id: string;
    name: string;
    barbershopId: string;
    price: number | string;
    description: string;
    imageUrl: string;
  };
  barber: {
    id: string;
    name: string;
    imageUrl: string;
  };
  barbershop: {
    id: string;
    name: string;
    address: string;
    imageUrl: string;
  };
};

export type CarouselItem = {
  id: number;
  image_url: string;
  description?: string | null;
  display_order: number;
  active: boolean;
  created_at?: string | Date;
  updated_at?: string | Date;
};