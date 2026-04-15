import Link from "next/link";
import { ArrowRight, CalendarDays, TrendingUp, Users, CheckCircle2 } from "lucide-react";

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
    <section className="px-4 pt-4 sm:px-5 sm:pt-6">
      <div className="overflow-hidden rounded-[28px] border border-zinc-800 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 text-white shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
        <div className="relative p-5 sm:p-6 md:p-8 lg:p-10">
          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-[hsl(43_96%_56%_/_0.10)] blur-3xl sm:h-44 sm:w-44" />
          <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-white/5 blur-3xl sm:h-44 sm:w-44" />

          <div className="relative z-10 grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1.2fr)_420px] xl:items-stretch">
            <div className="flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center rounded-full border border-[hsl(43_96%_56%_/_0.22)] bg-[hsl(43_96%_56%_/_0.08)] px-3 py-1 text-[11px] font-medium text-[hsl(43_96%_56%)] sm:text-xs">
                  Painel do barbeiro
                </div>

                <h1 className="mt-4 max-w-2xl text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                  Olá, {barberName}! Sua agenda começa aqui.
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-300 sm:text-base">
                  Acompanhe seus atendimentos, crie novos agendamentos e visualize
                  rapidamente seus principais indicadores do dia.
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="premium-button h-12 rounded-2xl px-6 font-semibold"
                >
                  <Link href={`/dashboard/barbershop/${barberBarbershopId}`}>
                    Ver agenda
                    <ArrowRight className="ml-2" size={18} />
                  </Link>
                </Button>

                <Button
                  asChild
                  size="lg"
                  className="premium-outline-button h-12 rounded-2xl px-6 font-semibold"
                >
                  <Link
                    href={`/dashboard/barbershop/${barberBarbershopId}?createBooking=true`}
                  >
                    Criar agendamento
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <HeroMetricCard
                icon={<CalendarDays size={18} />}
                label="Hoje"
                value={stats.todayBookings}
                helper="agendamentos"
              />

              <HeroMetricCard
                icon={<CheckCircle2 size={18} />}
                label="Concluídos"
                value={stats.completedToday}
                helper="hoje"
              />

              <HeroMetricCard
                icon={<Users size={18} />}
                label="Clientes"
                value={stats.monthClients}
                helper="no mês"
              />

              <HeroMetricCard
                icon={<TrendingUp size={18} />}
                label="Crescimento"
                value={`${stats.growthPercent >= 0 ? "+" : ""}${stats.growthPercent}%`}
                helper="vs mês passado"
                highlight
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

interface HeroMetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  helper: string;
  highlight?: boolean;
}

function HeroMetricCard({
  icon,
  label,
  value,
  helper,
  highlight = false,
}: HeroMetricCardProps) {
  return (
    <div
      className={[
        "rounded-[24px] border p-4 backdrop-blur transition-all",
        highlight
          ? "border-[hsl(43_96%_56%_/_0.25)] bg-[hsl(43_96%_56%_/_0.08)]"
          : "border-white/10 bg-white/5",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            className={[
              "text-[11px] uppercase tracking-[0.14em]",
              highlight ? "text-[hsl(43_96%_56%)]" : "text-zinc-300",
            ].join(" ")}
          >
            {label}
          </p>

          <p className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {value}
          </p>

          <p className="mt-1 text-xs text-zinc-300">{helper}</p>
        </div>

        <div
          className={[
            "flex h-10 w-10 items-center justify-center rounded-2xl border",
            highlight
              ? "border-[hsl(43_96%_56%_/_0.25)] bg-[hsl(43_96%_56%_/_0.12)] text-[hsl(43_96%_56%)]"
              : "border-white/10 bg-white/5 text-zinc-200",
          ].join(" ")}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}