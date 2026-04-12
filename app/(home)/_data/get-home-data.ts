import { headers } from "next/headers";

import type { HomeData } from "../../types/home.types";

async function getBaseUrl() {
  const host = headers().get("host");
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";

  return `${protocol}://${host}`;
}

export async function getHomeData(userId?: string): Promise<HomeData> {
  const baseUrl = await getBaseUrl();

  const [barbershopsRes, bookingsRes, lastBookingRes, carouselRes] =
    await Promise.all([
      fetch(`${baseUrl}/api/v1/barbershops?page=1&limit=10`, {
        cache: "no-store",
      }),
      userId
        ? fetch(`${baseUrl}/api/v1/bookings?userId=${userId}`, {
            cache: "no-store",
          })
        : Promise.resolve(null),
      userId
        ? fetch(`${baseUrl}/api/v1/bookings/last-completed?userId=${userId}`, {
            cache: "no-store",
          })
        : Promise.resolve(null),
      fetch(`${baseUrl}/api/v1/carousel`, {
        cache: "no-store",
      }),
    ]);

  const barbershopsData = await barbershopsRes.json().catch(() => ({
    data: [],
  }));

  const bookingsData = await bookingsRes?.json().catch(() => ({
    data: [],
  }));

  const lastBookingData = await lastBookingRes?.json().catch(() => ({
    data: null,
  }));

  const carouselData = await carouselRes.json().catch(() => ({
    data: [],
  }));

  return {
    recommendedBarbershops: barbershopsData?.data ?? [],
    confirmedBookings: bookingsData?.data ?? [],
    lastCompletedBooking: lastBookingData?.data ?? null,
    carouselItems: carouselData?.data ?? [],
  };
}