import { getServerSession } from "next-auth";
import Header from "../_components/header";
import { redirect } from "next/navigation";
import { db } from "../lib/repositories/prisma";
import BookingItem from "../_components/booking-item";
import { authOptions } from "../lib/auth";

const BookingsPage = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/");
  }

  const userId = (session.user as any).id;

  const [confirmedBookings, finishedBookings] = await Promise.all([
    db.booking.findMany({
      where: {
        userId,
        date: {
          gte: new Date(),
        },
      },
      include: {
        service: true,
        barbershop: true,
        barber: true, // ✅ ADICIONADO
      },
      orderBy: {
        date: "asc",
      },
    }),

    db.booking.findMany({
      where: {
        userId,
        date: {
          lt: new Date(),
        },
      },
      include: {
        service: true,
        barbershop: true,
        barber: true, // ✅ ADICIONADO
      },
      orderBy: {
        date: "desc",
      },
    }),
  ]);

  return (
    <>
      <Header />

      <div className="px-5 py-6">
        <h1 className="text-xl font-bold mb-6">Agendamentos</h1>

        {/* CONFIRMADOS */}
        {confirmedBookings.length > 0 && (
          <>
            <h2 className="text-gray-400 uppercase font-bold text-sm mb-3">
              Confirmados
            </h2>

            <div className="flex flex-col gap-3">
              {confirmedBookings.map((booking) => (
                <BookingItem key={booking.id} booking={booking} />
              ))}
            </div>
          </>
        )}

        {/* FINALIZADOS */}
        {finishedBookings.length > 0 && (
          <>
            <h2 className="text-gray-400 uppercase font-bold text-sm mt-6 mb-3">
              Finalizados
            </h2>

            <div className="flex flex-col gap-3">
              {finishedBookings.map((booking) => (
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