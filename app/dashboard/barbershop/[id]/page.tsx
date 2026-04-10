import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { db } from "@/app/lib/repositories/prisma";
import BarbershopCalendar from "../../_components/barbershop-calendar";
import Header from "@/app/_components/header";

export default async function DashboardBarbershopPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return <p className="p-6 text-white">Você precisa estar logado.</p>;
  }

  if (session.user.role !== "BARBER") {
    return <p className="p-6 text-white">Acesso negado.</p>;
  }

  if (String(session.user.barbershopId) !== String(params.id)) {
    return <p className="p-6 text-white">Sem acesso a essa unidade.</p>;
  }

  const barbershop = await db.barbershop.findUnique({
    where: { id: params.id },
    include: {
      barbers: true,
      services: true,
    },
  });

  if (!barbershop) {
    return <p className="p-6 text-white">Barbearia não encontrada.</p>;
  }

  const bookings = await db.booking.findMany({
    where: {
      barber: {
        barbershopId: params.id,
      },
    },
    include: {
      barber: true,
      user: true,
      service: true,
    },
    orderBy: {
      date: "asc",
    },
  });
  const scheduleBlocks = await db.scheduleBlock.findMany({
  where: {
    barber: {
      barbershopId: params.id,
    },
  },
  orderBy: {
    startDate: "asc",
  },
});

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Header />

      <div className="border-b border-zinc-800 bg-zinc-950/95 backdrop-blur">
        <div className="mx-auto max-w-[1600px] px-6 py-5">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
            Dashboard
          </p>
          <div className="mt-2 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{barbershop.name}</h1>
              <p className="mt-1 text-sm text-zinc-400">
                {barbershop.address}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-right">
              <p className="text-xs text-zinc-400">Barbeiros da unidade</p>
              <p className="text-lg font-semibold">
                {barbershop.barbers.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-6 py-6">
        <BarbershopCalendar
          barbers={barbershop.barbers}
          bookings={bookings}
          services={barbershop.services}
          scheduleBlocks={scheduleBlocks}
          barbershopId={barbershop.id}
          currentBarberId={session.user.barberId ?? session.user.id} />
      </div>
    </div>
  );
}