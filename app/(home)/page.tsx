// app/page/page.tsx (FINAL)

import { format } from "date-fns";
import Header from "../_components/header";
import { ptBR } from "date-fns/locale";
import Search from "./_components/search";
import BookingItem from "../_components/booking-item";
import { db } from "../_lib/prisma";
import BarbershopItem from "./_components/barbershop-item";
import { getServerSession } from "next-auth";
import { authOptions } from "../_lib/auth";
import { Barbershop } from "@prisma/client";

// 💡 NOVOS IMPORTS:
import QuickRebookingBanner from "./_components/quick-rebooking-banner"; // O novo componente
import { getLastCompletedBooking } from "../_actions/get-last-completed-booking"; 

export default async function Home() {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    // Ajuste no Promise.all para incluir o último agendamento concluído
    const [barbershops, recommendedBarbershops, confirmedBookings, lastCompletedBooking] = await Promise.all([
        db.barbershop.findMany({}),
        db.barbershop.findMany({
            orderBy: {
                id: "asc",
            },
        }),
        userId
            ? db.booking.findMany({
                where: {
                    userId: userId,
                    date: {
                        gte: new Date(),
                    },
                },
                include: {
                    service: true,
                    barbershop: true,
                },
            })
            : Promise.resolve([]),
        
        // Busca do Último Agendamento Concluído para o Banner:
        userId ? getLastCompletedBooking(userId) : Promise.resolve(null),
    ]);

    return (
        <div>
            <Header />

            {/* 1. SEÇÃO DE SAUDAÇÃO E DATA */}
            <div className="px-5 pt-5">
                <h2 className="text-xl font-bold">
                    {session?.user ? `Olá, ${session.user.name?.split(" ")[0]}!` : "Olá! Vamos agendar um corte hoje?"}
                </h2>
                <p className="capitalize text-sm">
                    {format(new Date(), "EEEE',' dd 'de' MMMM", {
                        locale: ptBR,
                    })}
                </p>
            </div>
            
            {/* 🚀 2. O NOVO BANNER DE REAGENDAMENTO RÁPIDO */}
            {/* É renderizado condicionalmente APÓS a saudação. */}
            {lastCompletedBooking && <QuickRebookingBanner lastBooking={lastCompletedBooking} />}


            {/* 3. INPUT DE BUSCA (AGORA ABAIXO DO BANNER) */}
            <div className="px-5 mt-6">
                <Search />
            </div>

            {/* 4. AGENDAMENTOS CONFIRMADOS */}
            <div className="mt-6">
                {confirmedBookings.length > 0 && (
                    <>
                        <h2 className="pl-5 text-xs mb-3 uppercase text-gray-400 font-bold">Agendamentos</h2>
                        <div className="px-5 flex gap-3 overflow-x-auto [&::-webkit-scrollbar]:hidden">
                            {confirmedBookings.map((booking) => (
                                <BookingItem key={booking.id} booking={booking} />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* 5. UNIDADES */}
            <div className="mt-6 mb-[4.5rem]">
                <h2 className="px-5 text-xs mb-3 uppercase text-gray-400 font-bold">Unidades</h2>

                <div className="flex px-5 gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden">
                    {recommendedBarbershops.map((barbershop: Barbershop) => (
                        <div key={barbershop.id} className="min-w-[167px] max-w-[167px]">
                            <BarbershopItem key={barbershop.id} barbershop={barbershop} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}