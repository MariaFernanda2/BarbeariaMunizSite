import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getServerSession } from "next-auth";
import { headers } from "next/headers";

import { authOptions } from "@/app/lib/auth";
import Header from "@/app/_components/header";
import BookingItem from "@/app/_components/booking-item";
import Search from "./_components/search";
import BarbershopItem from "./_components/barbershop-item";
import QuickRebookingBanner from "./_components/quick-rebooking-banner";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  // 🔥 Base URL dinâmica (funciona em qualquer ambiente)
  const host = headers().get("host");
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const baseUrl = `${protocol}://${host}`;

  // 🔥 Requests paralelas
  const [barbershopsRes, bookingsRes, lastBookingRes] =
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
        ? fetch(
            `${baseUrl}/api/v1/bookings/last-completed?userId=${userId}`,
            { cache: "no-store" }
          )
        : Promise.resolve(null),
    ]);

  // 🔥 JSON seguro
  const barbershopsData = await barbershopsRes.json().catch(() => ({
    data: [],
  }));

  const bookingsData = await bookingsRes?.json().catch(() => ({
    data: [],
  }));

  const lastBookingData = await lastBookingRes?.json().catch(() => ({
    data: null,
  }));

  const recommendedBarbershops = barbershopsData?.data ?? [];
  const confirmedBookings = bookingsData?.data ?? [];
  const lastCompletedBooking = lastBookingData?.data ?? null;

  return (
    <div>
      <Header />

      {/* SAUDAÇÃO */}
      <div className="px-5 pt-5">
        <h2 className="text-xl font-bold">
          {session?.user
            ? `Olá, ${session.user.name?.split(" ")[0]}!`
            : "Olá! Vamos agendar um corte hoje?"}
        </h2>
        <p className="capitalize text-sm">
          {format(new Date(), "EEEE',' dd 'de' MMMM", { locale: ptBR })}
        </p>
      </div>

      {/* REAGENDAMENTO RÁPIDO */}
      {lastCompletedBooking && (
        <QuickRebookingBanner lastBooking={lastCompletedBooking} />
      )}

      {/* SEARCH */}
      <div className="px-5 mt-6">
        <Search />
      </div>

      {/* AGENDAMENTOS */}
      {confirmedBookings.length > 0 && (
        <div className="mt-6">
          <h2 className="pl-5 text-xs mb-3 uppercase text-gray-400 font-bold">
            Agendamentos
          </h2>

          <div className="px-5 flex gap-3 overflow-x-auto">
            {confirmedBookings.map((booking: any) => (
              <BookingItem key={booking.id} booking={booking} />
            ))}
          </div>
        </div>
      )}

      {/* BARBEARIAS */}
      <div className="mt-6 mb-[4.5rem]">
        <h2 className="px-5 text-xs mb-3 uppercase text-gray-400 font-bold">
          Unidades
        </h2>

        <div className="flex px-5 gap-4 overflow-x-auto">
          {recommendedBarbershops.map((barbershop: any) => (
            <div key={barbershop.id} className="min-w-[167px] max-w-[167px]">
              <BarbershopItem barbershop={barbershop} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
