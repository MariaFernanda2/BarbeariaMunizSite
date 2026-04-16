import {
  CalendarDays,
  CheckCircle2,
  Users,
  DollarSign,
  Receipt,
  Percent,
} from "lucide-react";

interface MetricsKpiGridProps {
  metrics: {
    totalBookings: number;
    completedBookings: number;
    uniqueClients: number;
    totalRevenue: number;
    averageTicket: number;
    completionRate: number;
  };
}

function Card({
  icon,
  label,
  value,
  helper,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  helper: string;
}) {
  return (
    <div className="premium-home-card rounded-[24px] p-5 text-white">
      <div className="flex items-center justify-between">
        <div className="premium-icon-badge">{icon}</div>
      </div>

      <p className="mt-4 text-xs uppercase tracking-wide text-zinc-400">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold">{value}</p>

      <p className="mt-1 text-xs text-zinc-400">{helper}</p>
    </div>
  );
}

export default function MetricsKpiGrid({ metrics }: MetricsKpiGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <Card
        icon={<CalendarDays size={18} />}
        label="Agendamentos"
        value={metrics.totalBookings}
        helper="Total no período"
      />

      <Card
        icon={<CheckCircle2 size={18} />}
        label="Concluídos"
        value={metrics.completedBookings}
        helper="Atendimentos finalizados"
      />

      <Card
        icon={<Users size={18} />}
        label="Clientes únicos"
        value={metrics.uniqueClients}
        helper="Clientes atendidos"
      />

      <Card
        icon={<DollarSign size={18} />}
        label="Receita"
        value={`R$ ${metrics.totalRevenue.toFixed(2)}`}
        helper="Somente concluídos"
      />

      <Card
        icon={<Receipt size={18} />}
        label="Ticket médio"
        value={`R$ ${metrics.averageTicket.toFixed(2)}`}
        helper="Por atendimento"
      />

      <Card
        icon={<Percent size={18} />}
        label="Taxa de conclusão"
        value={`${metrics.completionRate.toFixed(0)}%`}
        helper="No período"
      />
    </div>
  );
}