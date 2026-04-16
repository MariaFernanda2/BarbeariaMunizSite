interface MetricsSideSummaryProps {
  stats: {
    bookings: number;
    confirmed: number;
    completed: number;
    canceled: number;
    recurringClients: number;
  };
}

export function MetricsSideSummary({ stats }: MetricsSideSummaryProps) {
  const items = [
    {
      label: "Agendamentos",
      value: stats.bookings,
      helper: "Total no período",
    },
    {
      label: "Confirmados",
      value: stats.confirmed,
      helper: "Aguardando atendimento",
    },
    {
      label: "Concluídos",
      value: stats.completed,
      helper: "Finalizados com sucesso",
    },
    {
      label: "Cancelados",
      value: stats.canceled,
      helper: "Não concluídos",
    },
    {
      label: "Recorrentes",
      value: stats.recurringClients,
      helper: "Clientes que voltaram",
    },
  ];

  return (
    <div className="premium-home-card rounded-[28px] p-5 text-white sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Resumo lateral</h3>
          <p className="mt-1 text-sm text-zinc-400">
            Leitura rápida dos principais números
          </p>
        </div>

        <div className="premium-icon-badge">📌</div>
      </div>

      <div className="mt-6 space-y-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-zinc-300">{item.label}</p>
                <p className="mt-1 text-xs text-zinc-400">{item.helper}</p>
              </div>

              <p className="text-2xl font-bold text-white">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}