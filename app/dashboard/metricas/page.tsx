import { getServerSession } from "next-auth";
import Header from "@/app/_components/header";
import { authOptions } from "@/app/lib/auth";
import { db } from "@/app/lib/repositories/prisma";
import { getMetrics } from "@/app/lib/services/barber-metrics.service";
import {
  getMetricsDateRange,
  parseMetricsPeriod,
} from "@/app/lib/utils/metrics-period";

import MetricsHeader from "@/app/dashboard/_components/metrics-header";
import MetricsKpiGrid from "@/app/dashboard/_components/metrics-kpi-grid";
import MetricsMainChart from "@/app/dashboard/_components/metrics-main-chart";
import RevenueChart from "@/app/dashboard/_components/revenue-chart";
import { MetricsSideSummary } from "@/app/dashboard/_components/metrics-side-summary";
import { RevenueCard } from "@/app/dashboard/_components/revenue-card";
import ServicesChartCard from "@/app/dashboard/_components/services-chart-card";

interface MetricsPageProps {
  searchParams?: {
    barberId?: string;
    period?: string;
  };
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatPercent(value: number) {
  const rounded = Math.round(value);
  return `${value >= 0 ? "+" : ""}${rounded}%`;
}

export default async function MetricsPage({
  searchParams,
}: MetricsPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return <p className="p-6 text-white">Você precisa estar logado.</p>;
  }

  if (!session.user.barbershopId) {
    return <p className="p-6 text-white">Barbearia não encontrada.</p>;
  }

  const barbershopId = String(session.user.barbershopId);
  const selectedPeriod = parseMetricsPeriod(searchParams?.period);
  const dateRange = getMetricsDateRange(selectedPeriod);

  const barbershop = await db.barbershop.findUnique({
    where: { id: barbershopId },
    include: {
      barbers: {
        orderBy: {
          name: "asc",
        },
      },
    },
  });

  if (!barbershop) {
    return <p className="p-6 text-white">Barbearia não encontrada.</p>;
  }

  const requestedBarberId = searchParams?.barberId
    ? String(searchParams.barberId)
    : undefined;

  const selectedBarber = requestedBarberId
    ? barbershop.barbers.find((barber) => barber.id === requestedBarberId) ?? null
    : null;

  const validatedBarberId = selectedBarber?.id;

  const metrics = await getMetrics({
    barbershopId,
    barberId: validatedBarberId,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    previousStartDate: dateRange.previousStartDate,
    previousEndDate: dateRange.previousEndDate,
  });

  const modeLabel = selectedBarber
    ? `Visualizando: ${selectedBarber.name}`
    : "Visualizando: Geral da unidade";

  const revenueByBarber: { name: string; value: number }[] =
  metrics.charts.revenueByBarber ?? [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="mx-auto max-w-[1600px] space-y-6 px-4 py-4 sm:px-5 sm:py-6">
        <MetricsHeader
          barbers={barbershop.barbers}
          selectedBarberId={validatedBarberId}
          selectedPeriod={selectedPeriod}
        />

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center rounded-full border border-[hsl(43_96%_56%_/_0.22)] bg-[hsl(43_96%_56%_/_0.08)] px-3 py-1 text-xs font-medium text-[hsl(43_96%_56%)]">
            {modeLabel}
          </div>

          <div className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
            Período: {dateRange.label}
          </div>
        </div>

        <MetricsKpiGrid
          metrics={{
            totalBookings: metrics.summary.totalBookings,
            completedBookings: metrics.summary.completedBookings,
            uniqueClients: metrics.summary.uniqueClients,
            totalRevenue: metrics.summary.totalRevenue,
            averageTicket: metrics.summary.averageTicket,
            completionRate: metrics.summary.completionRate,
          }}
        />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="xl:col-span-8">
            <MetricsMainChart data={metrics.charts.bookings} />
          </div>

          <div className="xl:col-span-4">
            <MetricsSideSummary
              stats={{
                bookings: metrics.summary.totalBookings,
                confirmed: metrics.summary.confirmedBookings,
                completed: metrics.summary.completedBookings,
                canceled: metrics.summary.canceledBookings,
                recurringClients: metrics.summary.recurringClients,
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="xl:col-span-8">
            <RevenueChart data={metrics.charts.revenue} />
          </div>

          <div className="xl:col-span-4">
            <RevenueCard
              revenue={{
                total: formatCurrency(metrics.summary.totalRevenue),
                services: formatCurrency(metrics.summary.totalRevenue),
                products: "R$ 0,00",
                averageTicket: formatCurrency(metrics.summary.averageTicket),
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="xl:col-span-5">
            <ServicesChartCard data={metrics.charts.services} />
          </div>

          <div className="xl:col-span-7">
            <div className="premium-home-card rounded-[28px] p-6 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">Resumo inteligente</h3>
                  <p className="mt-1 text-sm text-zinc-400">
                    Comparação com o período anterior
                  </p>
                </div>

                <div className="premium-icon-badge">★</div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-wide text-zinc-400">
                    Serviço mais pedido
                  </p>
                  <p className="mt-2 text-xl font-bold text-white">
                    {metrics.summary.topService}
                  </p>
                  <p className="mt-1 text-sm text-zinc-400">
                    {metrics.summary.topServiceBookings} atendimento(s)
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-wide text-zinc-400">
                    Clientes recorrentes
                  </p>
                  <p className="mt-2 text-xl font-bold text-white">
                    {metrics.summary.recurringClients}
                  </p>
                  <p className="mt-1 text-sm text-zinc-400">
                    voltaram mais de uma vez
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-wide text-zinc-400">
                    Crescimento de receita
                  </p>
                  <p className="mt-2 text-xl font-bold text-white">
                    {formatPercent(metrics.summary.growth.revenuePercent)}
                  </p>
                  <p className="mt-1 text-sm text-zinc-400">
                    antes: {formatCurrency(metrics.previous.totalRevenue)}
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-wide text-zinc-400">
                    Crescimento de agendamentos
                  </p>
                  <p className="mt-2 text-xl font-bold text-white">
                    {formatPercent(metrics.summary.growth.bookingsPercent)}
                  </p>
                  <p className="mt-1 text-sm text-zinc-400">
                    antes: {metrics.previous.totalBookings} agendamento(s)
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-wide text-zinc-400">
                    Crescimento de clientes
                  </p>
                  <p className="mt-2 text-xl font-bold text-white">
                    {formatPercent(metrics.summary.growth.clientsPercent)}
                  </p>
                  <p className="mt-1 text-sm text-zinc-400">
                    antes: {metrics.previous.uniqueClients} cliente(s)
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-wide text-zinc-400">
                    Taxa de conclusão
                  </p>
                  <p className="mt-2 text-xl font-bold text-white">
                    {metrics.summary.completionRate.toFixed(0)}%
                  </p>
                  <p className="mt-1 text-sm text-zinc-400">
                    no período selecionado
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {!validatedBarberId && (
          <div className="premium-home-card rounded-[28px] p-6 text-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">Faturamento por barbeiro</h3>
                <p className="mt-1 text-sm text-zinc-400">
                  Visão consolidada da unidade no período selecionado
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {revenueByBarber.length > 0 ? (
                revenueByBarber.map((item) => (
                  <div
                    key={item.name}
                    className="rounded-3xl border border-white/10 bg-white/5 p-4"
                  >
                    <p className="text-sm font-medium text-zinc-300">
                      {item.name}
                    </p>
                    <p className="mt-2 text-2xl font-bold text-white">
                      {formatCurrency(Number(item.value))}
                    </p>
                    <p className="mt-1 text-xs text-zinc-400">
                      Receita acumulada no período
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-400">
                  Nenhum faturamento encontrado no período.
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}