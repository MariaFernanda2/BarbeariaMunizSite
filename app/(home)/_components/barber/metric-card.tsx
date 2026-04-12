import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/app/_components/ui/card";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
}

export default function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
}: MetricCardProps) {
  return (
    <Card className="rounded-3xl border border-zinc-200 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-zinc-600">{title}</p>

            <h3 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">
              {value}
            </h3>

            <p className="mt-1 text-xs text-zinc-500">{subtitle}</p>
          </div>

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-700">
            <Icon size={20} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}