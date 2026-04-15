import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";

import Header from "../_components/header";
import BookingItem from "../_components/booking-item";
import { authOptions } from "../lib/auth";
import { db } from "../lib/repositories/prisma";
import type { BookingSummary } from "@/app/types/home.types";

type BookingWithRelations = Prisma.BookingGetPayload<{
  include: {
    service: true;
    barbershop: true;
    barber: true;
  };
}>;

function normalizeBooking(booking: BookingWithRelations): BookingSummary {
  return {
    id: booking.id,
    date: booking.date.toISOString(),
    status: booking.status,
    service: {
      id: booking.service.id,
      name: booking.service.name,
      barbershopId: booking.service.barbershopId,
      price: Number(booking.service.price),
      description: booking.service.description,
      imageUrl: booking.service.imageUrl,
    },
    barber: {
      id: booking.barber.id,
      name: booking.barber.name,
      imageUrl: booking.barber.imageUrl,
    },
    barbershop: {
      id: booking.barbershop.id,
      name: booking.barbershop.name,
      imageUrl: booking.barbershop.imageUrl,
      address: booking.barbershop.address,
    },
  };
}

const BookingsPage = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/");
  }

  const userId = (session.user as any).id;

  const bookingsRaw: BookingWithRelations[] = await db.booking.findMany({
    where: {
      userId,
    },
    include: {
      service: true,
      barbershop: true,
      barber: true,
    },
    orderBy: {
      date: "asc",
    },
  });

  const normalizedBookings = bookingsRaw.map(normalizeBooking);

  const confirmedBookings = normalizedBookings.filter(
    (booking) => booking.status === "CONFIRMED"
  );

  const finishedBookings = normalizedBookings
    .filter((booking) => booking.status === "COMPLETED")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const canceledBookings = normalizedBookings
    .filter((booking) => booking.status === "CANCELED")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const hasBookings =
    confirmedBookings.length > 0 ||
    finishedBookings.length > 0 ||
    canceledBookings.length > 0;

  return (
    <>
      <Header />

      <div className="px-5 py-6">
        <h1 className="mb-6 text-xl font-bold">Agendamentos</h1>

        {!hasBookings && (
          <p className="text-sm text-gray-400">
            Você ainda não possui agendamentos.
          </p>
        )}

        {confirmedBookings.length > 0 && (
          <>
            <h2 className="mb-3 text-sm font-bold uppercase text-gray-400">
              Confirmados
            </h2>

            <div className="flex flex-col gap-3">
              {confirmedBookings.map((booking) => (
                <BookingItem key={booking.id} booking={booking} />
              ))}
            </div>
          </>
        )}

        {finishedBookings.length > 0 && (
          <>
            <h2 className="mb-3 mt-6 text-sm font-bold uppercase text-gray-400">
              Finalizados
            </h2>

            <div className="flex flex-col gap-3">
              {finishedBookings.map((booking) => (
                <BookingItem key={booking.id} booking={booking} />
              ))}
            </div>
          </>
        )}

        {canceledBookings.length > 0 && (
          <>
            <h2 className="mb-3 mt-6 text-sm font-bold uppercase text-gray-400">
              Cancelados
            </h2>

            <div className="flex flex-col gap-3">
              {canceledBookings.map((booking) => (
                <BookingItem key={booking.id} booking={booking} />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default BookingsPage;