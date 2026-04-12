import type { LucideIcon } from "lucide-react";

interface PerformanceItemProps {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
}

export default function PerformanceItem({
  title,
  value,
  description,
  icon: Icon,
}: PerformanceItemProps) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-700">
        <Icon size={18} />
      </div>

      <p className="text-sm font-medium text-zinc-600">{title}</p>
      <h3 className="mt-2 text-lg font-semibold text-zinc-900">{value}</h3>
      <p className="mt-2 text-xs leading-relaxed text-zinc-500">{description}</p>
    </div>
  );
}