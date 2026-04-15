import { ReactNode } from "react";
import { Card, CardContent } from "@/app/_components/ui/card";

interface SummaryItem {
  label: string;
  value: string | number;
  helper: string;
}

interface HomeSummaryCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  items: SummaryItem[];
}

export function HomeSummaryCard({
  title,
  description,
  icon,
  items,
}: HomeSummaryCardProps) {
  return (
    <Card className="rounded-[30px] border border-[hsl(43_96%_56%_/_0.45)] bg-gradient-to-b from-[#fffdf7] to-white shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-[28px] font-semibold tracking-tight text-zinc-950">
              {title}
            </h3>
            <p className="mt-1 text-sm text-zinc-600">{description}</p>
          </div>

          <div className="premium-icon-badge h-12 w-12 rounded-2xl">
            {icon}
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {items.map((item) => (
            <div
              key={item.label}
              className="rounded-[24px] border border-zinc-200 bg-white px-4 py-4 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                {item.label}
              </p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-950">
                {item.value}
              </p>
              <p className="mt-1 text-sm text-zinc-600">{item.helper}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}