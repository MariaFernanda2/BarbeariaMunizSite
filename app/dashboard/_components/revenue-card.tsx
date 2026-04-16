interface RevenueCardProps {
  revenue: {
    total: string;
    services: string;
    products: string;
    averageTicket: string;
  };
}

export function RevenueCard({ revenue }: RevenueCardProps) {
  return (
    <div className="premium-home-card rounded-[28px] p-6 text-white">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">Receita</h3>
          <p className="text-sm text-zinc-400">Resumo financeiro</p>
        </div>

        <div className="premium-icon-badge">💰</div>
      </div>

      <p className="mt-6 text-3xl font-bold">{revenue.total}</p>

      <div className="mt-6 space-y-3 text-sm">
        <div className="flex justify-between text-zinc-300">
          <span>Serviços</span>
          <span>{revenue.services}</span>
        </div>

        <div className="flex justify-between text-zinc-300">
          <span>Produtos</span>
          <span>{revenue.products}</span>
        </div>

        <div className="flex justify-between text-zinc-300">
          <span>Ticket médio</span>
          <span>{revenue.averageTicket}</span>
        </div>
      </div>
    </div>
  );
}