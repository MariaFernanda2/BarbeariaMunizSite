import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/app/_components/ui/button";
import type { BarberHeroStats } from "../../../types/home.types";

interface BarberHeroProps {
  barberBarbershopId: string;
  barberName: string;
  stats: BarberHeroStats;
}

export default function BarberHero({
  barberBarbershopId,
  barberName,
  stats,
}: BarberHeroProps) {
  return (
    <section className="px-5 pt-6">
      <div className="overflow-hidden rounded-[28px] border border-zinc-800 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 text-white shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
        <div className="relative p-6 md:p-8">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-white/5 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
                Painel do barbeiro
              </div>

              <h1 className="mt-4 text-2xl font-bold tracking-tight text-white md:text-3xl">
                Olá, {barberName}! Sua agenda começa aqui.
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-300 md:text-base">
                Acompanhe seus atendimentos, crie novos agendamentos e veja um
                resumo rápido do seu desempenho.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="rounded-2xl bg-white px-6 text-black hover:bg-zinc-200"
                >
                  <Link href={`/dashboard/barbershop/${barberBarbershopId}`}>
                    Ver agenda
                    <ArrowRight className="ml-2" size={18} />
                  </Link>
                </Button>

                <Button
                  asChild
                  size="lg"
                  className="rounded-2xl border border-white/10 bg-white/10 text-white hover:bg-white/20"
                >
                  <Link href={`/dashboard/barbershop/${barberBarbershopId}?createBooking=true`}>
                    Criar agendamento
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:min-w-[320px]">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-wide text-zinc-300">Hoje</p>
                <p className="mt-2 text-2xl font-bold text-white">
                  {stats.todayBookings}
                </p>
                <p className="text-xs text-zinc-300">agendamentos</p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-wide text-zinc-300">
                  Concluídos
                </p>
                <p className="mt-2 text-2xl font-bold text-white">
                  {stats.completedToday}
                </p>
                <p className="text-xs text-zinc-300">hoje</p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-wide text-zinc-300">
                  Clientes
                </p>
                <p className="mt-2 text-2xl font-bold text-white">
                  {stats.monthClients}
                </p>
                <p className="text-xs text-zinc-300">no mês</p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-wide text-zinc-300">
                  Crescimento
                </p>
                <p className="mt-2 text-2xl font-bold text-white">
                  {stats.growthPercent >= 0 ? "+" : ""}
                  {stats.growthPercent}%
                </p>
                <p className="text-xs text-zinc-300">vs mês passado</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}