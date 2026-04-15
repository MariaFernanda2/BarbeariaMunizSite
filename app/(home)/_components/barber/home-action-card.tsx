import Link from "next/link";
import { ReactNode } from "react";

import { Button } from "@/app/_components/ui/button";
import { Card, CardContent } from "@/app/_components/ui/card";

interface HomeActionCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  buttonLabel: string;
  href?: string;
  disabled?: boolean;
  buttonVariant?: "primary" | "secondary";
}

export function HomeActionCard({
  icon,
  title,
  description,
  buttonLabel,
  href,
  disabled = false,
  buttonVariant = "primary",
}: HomeActionCardProps) {
  const buttonClassName =
    buttonVariant === "primary"
      ? "premium-button h-11 w-full rounded-2xl text-sm font-semibold"
      : "premium-outline-button h-11 w-full rounded-2xl text-sm font-semibold";

  return (
    <Card className="premium-home-card h-full min-h-[280px] rounded-[28px] border-0 text-white">
      <CardContent className="flex h-full flex-col justify-between p-5 sm:p-6">
        <div>
          <div className="premium-icon-badge">{icon}</div>

          <h3 className="mt-5 text-xl font-semibold tracking-tight text-white">
            {title}
          </h3>

          <p className="mt-3 text-sm leading-7 text-zinc-300">
            {description}
          </p>
        </div>

        <div className="mt-8">
          {disabled ? (
            <Button
              disabled
              className="h-11 w-full rounded-2xl bg-zinc-800 text-zinc-400"
            >
              {buttonLabel}
            </Button>
          ) : href ? (
            <Button asChild className={buttonClassName}>
              <Link href={href}>{buttonLabel}</Link>
            </Button>
          ) : (
            <Button className={buttonClassName}>{buttonLabel}</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}