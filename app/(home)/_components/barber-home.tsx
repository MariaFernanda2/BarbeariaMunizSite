import Header from "@/app/_components/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { Scissors, Trophy, Users } from "lucide-react";

import type { BarberDashboardData, SessionUser } from "../../types/home.types";
import ActionCard from "../_components/barber/action-card";
import BarberHero from "../_components/barber/barber-hero";
import MetricCard from "../_components/barber/metric-card";
import PerformanceItem from "../_components/barber/performance-item";

interface BarberHomeProps {
  user: SessionUser;
  data: BarberDashboardData;
}

export default function BarberHome({ user, data }: BarberHomeProps) {
  const barberBarbershopId = user?.barbershopId ?? "1";
  const barberName = user?.name?.split(" ")[0] ?? "Barbeiro";

  return (
    <div className="min-h-screen bg-zinc-100">
      <Header />

      <main className="pb-24">
        <BarberHero
          barberBarbershopId={barberBarbershopId}
          barberName={barberName}
          stats={data.heroStats}
        />

        <section className="mt-6 grid grid-cols-1 gap-3 px-5 sm:grid-cols-2 lg:grid-cols-4">
          {data.metrics.map((metric) => (
            <MetricCard
              key={metric.title}
              title={metric.title}
              value={metric.value}
              subtitle={metric.subtitle}
              icon={metric.icon}
            />
          ))}
        </section>

        <section className="mt-6 grid grid-cols-1 gap-4 px-5 lg:grid-cols-3">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:col-span-2">
            {data.actions.map((action) => (
              <ActionCard
                key={action.title}
                title={action.title}
                description={action.description}
                href={action.href}
                cta={action.cta}
                icon={action.icon}
                tone={action.tone}
              />
            ))}
          </div>

          <Card className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-white shadow-[0_10px_28px_rgba(0,0,0,0.06)]">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg text-zinc-900">
                    <Trophy className="text-amber-500" size={18} />
                    Resumo rápido
                  </CardTitle>
                  <CardDescription className="text-zinc-600">
                    Indicadores atuais do seu desempenho
                  </CardDescription>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                  <Trophy size={18} />
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Serviço mais pedido
                </p>
                <h3 className="mt-1 text-base font-semibold text-zinc-900">
                  {data.performance.topService}
                </h3>
                <p className="mt-1 text-sm text-zinc-600">
                  Serviço com maior saída no mês atual
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Clientes recorrentes
                </p>
                <h3 className="mt-1 text-base font-semibold text-zinc-900">
                  {data.performance.recurringClients}
                </h3>
                <p className="mt-1 text-sm text-zinc-600">
                  Clientes que já voltaram mais de uma vez
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Bloqueios hoje
                </p>
                <h3 className="mt-1 text-base font-semibold text-zinc-900">
                  {data.performance.todayBlocks}
                </h3>
                <p className="mt-1 text-sm text-zinc-600">
                  Horários bloqueados na agenda de hoje
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mt-6 px-5">
          <Card className="rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900 to-black text-white shadow-[0_14px_34px_rgba(0,0,0,0.24)]">
            <CardHeader>
              <CardTitle className="text-lg text-white">
                Resumo de performance
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Visão rápida baseada nos dados reais da sua agenda
              </CardDescription>
            </CardHeader>

            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <PerformanceItem
                title="Serviço mais pedido"
                value={data.performance.topService}
                description="Serviço com maior saída no mês atual"
                icon={Scissors}
              />

              <PerformanceItem
                title="Clientes recorrentes"
                value={`${data.performance.recurringClients} clientes`}
                description="Retornaram para mais de um atendimento"
                icon={Users}
              />

              <PerformanceItem
                title="Bloqueios hoje"
                value={`${data.performance.todayBlocks}`}
                description="Horários bloqueados na agenda atual"
                icon={Trophy}
              />
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}