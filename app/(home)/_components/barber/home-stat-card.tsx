import { ReactNode } from "react";
import { Card, CardContent } from "@/app/_components/ui/card";

interface HomeStatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  helper: string;
}

export function HomeStatCard({
  icon,
  label,
  value,
  helper,
}: HomeStatCardProps) {
  return (
    <Card className="premium-home-card-light rounded-[26px] border-0">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-zinc-700">{label}</p>
            <p className="mt-3 text-4xl font-bold tracking-tight text-zinc-950">
              {value}
            </p>
            <p className="mt-2 text-sm text-zinc-500">{helper}</p>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-600">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}