interface ServiceItem {
  name: string;
  value: number;
}

interface ServicesChartCardProps {
  data: ServiceItem[];
}

export default function ServicesChartCard({
  data,
}: ServicesChartCardProps) {
  return (
    <div className="premium-home-card rounded-[28px] p-6 text-white">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">Serviços</h3>
          <p className="text-sm text-zinc-400">
            Mais vendidos no período
          </p>
        </div>

        <div className="premium-icon-badge">✂️</div>
      </div>

      <div className="mt-6 space-y-4">
        {data.length > 0 ? (
          data.map((service, index) => {
            const max = data[0]?.value || 1;
            const percent = (service.value / max) * 100;

            return (
              <div key={service.name}>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-300">
                    {index + 1}. {service.name}
                  </span>
                  <span className="text-white font-semibold">
                    {service.value}
                  </span>
                </div>

                <div className="mt-2 h-2 w-full rounded-full bg-white/10">
                  <div
                    className="h-2 rounded-full premium-gradient"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-zinc-400">
            Nenhum serviço encontrado
          </p>
        )}
      </div>
    </div>
  );
}