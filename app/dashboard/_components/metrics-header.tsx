import Link from "next/link";
import { BarChart3, Scissors } from "lucide-react";

import {
  METRICS_PERIOD_OPTIONS,
  type MetricsPeriod,
} from "@/app/lib/utils/metrics-period";

interface BarberOption {
  id: string;
  name: string;
}

interface MetricsHeaderProps {
  barbers: BarberOption[];
  selectedBarberId?: string;
  selectedPeriod: MetricsPeriod;
}

function buildMetricsHref(period: MetricsPeriod, barberId?: string) {
  const params = new URLSearchParams();

  params.set("period", period);

  if (barberId) {
    params.set("barberId", barberId);
  }

  return `/dashboard/metricas?${params.toString()}`;
}

export default function MetricsHeader({
  barbers,
  selectedBarberId,
  selectedPeriod,
}: MetricsHeaderProps) {
  return (
    <div className="premium-home-card rounded-[28px] p-5 text-white sm:p-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="premium-icon-badge">
              <BarChart3 size={20} />
            </div>

            <div>
              <div className="inline-flex items-center rounded-full border border-[hsl(43_96%_56%_/_0.2)] bg-[hsl(43_96%_56%_/_0.08)] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[hsl(43_96%_56%)]">
                Dashboard analítico
              </div>

              <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                Métricas da Barbearia
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
                Acompanhe faturamento, agendamentos, clientes e serviços mais
                vendidos com visão geral da unidade ou individual por barbeiro.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-zinc-400">
              Período
            </p>

            <div className="flex flex-wrap gap-2">
              {METRICS_PERIOD_OPTIONS.map((option) => (
                <Link
                  key={option.value}
                  href={buildMetricsHref(option.value, selectedBarberId)}
                  className={
                    selectedPeriod === option.value
                      ? "premium-button rounded-2xl px-4 py-2 text-sm font-semibold"
                      : "premium-outline-button rounded-2xl px-4 py-2 text-sm font-semibold"
                  }
                >
                  {option.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-zinc-400">
              Visualização
            </p>

            <div className="flex flex-wrap gap-2">
              <Link
                href={buildMetricsHref(selectedPeriod)}
                className={
                  !selectedBarberId
                    ? "premium-button rounded-2xl px-4 py-2 text-sm font-semibold"
                    : "premium-outline-button rounded-2xl px-4 py-2 text-sm font-semibold"
                }
              >
                Geral
              </Link>

              {barbers.map((barber) => (
                <Link
                  key={barber.id}
                  href={buildMetricsHref(selectedPeriod, barber.id)}
                  className={
                    selectedBarberId === barber.id
                      ? "premium-button rounded-2xl px-4 py-2 text-sm font-semibold"
                      : "premium-outline-button rounded-2xl px-4 py-2 text-sm font-semibold"
                  }
                >
                  <span className="inline-flex items-center gap-2">
                    <Scissors size={14} />
                    {barber.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}