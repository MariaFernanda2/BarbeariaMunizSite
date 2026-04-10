import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/app/_components/ui/card";
import { Button } from "@/app/_components/ui/button";

interface ActionCardProps {
  title: string;
  description: string;
  href: string;
  cta: string;
  icon: LucideIcon;
  tone?: "primary" | "secondary";
}

export default function ActionCard({
  title,
  description,
  href,
  cta,
  icon: Icon,
  tone = "primary",
}: ActionCardProps) {
  const buttonClassName =
    tone === "primary"
      ? "mt-5 w-full rounded-2xl bg-primary text-primary-foreground hover:opacity-90"
      : "mt-5 w-full rounded-2xl bg-zinc-800 text-white hover:bg-zinc-700";

  return (
    <Card className="group rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900 to-black text-white shadow-[0_12px_30px_rgba(0,0,0,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
      <CardContent className="p-5">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-800/80 text-zinc-100 transition-colors group-hover:bg-zinc-700">
          <Icon size={22} />
        </div>

        <h3 className="text-lg font-semibold text-white">{title}</h3>

        <p className="mt-2 min-h-[72px] text-sm leading-relaxed text-zinc-400">
          {description}
        </p>

        <Button asChild className={buttonClassName}>
          <Link href={href}>{cta}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}