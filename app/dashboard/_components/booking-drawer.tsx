"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  Scissors,
  UserRound,
  BadgeCheck,
  XCircle,
  CheckCircle2,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/app/_components/ui/sheet";
import { formatBookingInAppTimeZone, APP_TIME_ZONE } from "@/app/lib/utils/timezone";

type Booking = {
  id: string;
  date: string | Date;
  endDate?: string | Date;
  status: "CONFIRMED" | "COMPLETED" | "CANCELED";
  barber: {
    name: string;
  };
  user: {
    name: string | null;
  };
  service: {
    name: string;
    price: any;
  };
  clientName?: string | null;
  clientPhone?: string | null;
};

interface Props {
  booking: Booking | null;
  onClose: () => void;
}

function toLocalInputValue(date: string | Date) {
  const d = new Date(date);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

function formatDateTime(value: string | Date) {
  return formatBookingInAppTimeZone(value, "dd/MM/yyyy 'às' HH:mm", APP_TIME_ZONE);
}

function formatTimeRange(start: string | Date, end?: string | Date) {
  const startTime = formatBookingInAppTimeZone(start, "HH:mm", APP_TIME_ZONE);
  const endTime = end
    ? formatBookingInAppTimeZone(end, "HH:mm", APP_TIME_ZONE)
    : "--:--";

  return `${startTime} - ${endTime}`;
}

function formatCurrency(value: any) {
  return Number(value ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function getStatusLabel(status: Booking["status"]) {
  switch (status) {
    case "CONFIRMED":
      return "Confirmado";
    case "COMPLETED":
      return "Finalizado";
    case "CANCELED":
      return "Cancelado";
    default:
      return status;
  }
}

function getStatusClass(status: Booking["status"]) {
  switch (status) {
    case "CONFIRMED":
      return "border-[hsl(43_96%_56%_/_0.28)] bg-[hsl(43_96%_56%_/_0.12)] text-[hsl(43_96%_56%)]";
    case "COMPLETED":
      return "border-emerald-400/20 bg-emerald-500/10 text-emerald-300";
    case "CANCELED":
      return "border-red-400/20 bg-red-500/10 text-red-300";
    default:
      return "border-zinc-700 bg-zinc-900 text-zinc-300";
  }
}

function getStatusIcon(status: Booking["status"]) {
  switch (status) {
    case "CONFIRMED":
      return <Clock3 size={14} />;
    case "COMPLETED":
      return <CheckCircle2 size={14} />;
    case "CANCELED":
      return <XCircle size={14} />;
    default:
      return <BadgeCheck size={14} />;
  }
}

function InfoCard({
  icon,
  label,
  value,
  helper,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start gap-3">
        <div className="premium-icon-badge h-10 w-10 rounded-2xl">{icon}</div>

        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">
            {label}
          </p>
          <p className="mt-1 break-words text-sm font-semibold text-white">
            {value}
          </p>
          {helper ? (
            <p className="mt-1 text-xs text-zinc-400">{helper}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function BookingDetailsContent({
  booking,
  date,
  setDate,
  loading,
  errorMessage,
  onClose,
  onSaveTime,
  onCheckout,
}: {
  booking: Booking;
  date: string;
  setDate: (value: string) => void;
  loading: boolean;
  errorMessage: string | null;
  onClose?: () => void;
  onSaveTime: () => void;
  onCheckout: () => void;
}) {
  const clientDisplayName = booking.clientName || booking.user.name || "Cliente";
  const canCheckout = booking.status === "CONFIRMED";
  const canReschedule = booking.status !== "CANCELED";

  return (
    <div className="flex h-full flex-col bg-zinc-950">
      <div className="border-b border-white/10 bg-[radial-gradient(circle_at_top,hsl(43_96%_56%_/_0.08),transparent_28%)] px-5 py-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">
              Detalhes do agendamento
            </p>

            <h2 className="mt-2 truncate text-xl font-bold text-white">
              {clientDisplayName}
            </h2>

            <div
              className={`mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClass(
                booking.status
              )}`}
            >
              {getStatusIcon(booking.status)}
              {getStatusLabel(booking.status)}
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition hover:bg-white/10"
            >
              Fechar
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-5">
        <div className="grid gap-4">
          <InfoCard
            icon={<Scissors size={18} />}
            label="Serviço"
            value={booking.service.name}
            helper={formatCurrency(booking.service.price)}
          />

          <InfoCard
            icon={<UserRound size={18} />}
            label="Barbeiro"
            value={booking.barber.name}
          />

          <InfoCard
            icon={<CalendarDays size={18} />}
            label="Data e horário"
            value={formatDateTime(booking.date)}
            helper={formatTimeRange(booking.date, booking.endDate)}
          />

          {booking.clientPhone ? (
            <InfoCard
              icon={<Clock3 size={18} />}
              label="Contato"
              value={booking.clientPhone}
            />
          ) : null}
        </div>

        <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
          <div className="mb-3">
            <p className="text-sm font-semibold text-white">Reagendar horário</p>
            <p className="mt-1 text-xs text-zinc-400">
              Escolha um novo horário para este atendimento.
            </p>
          </div>

          <input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={!canReschedule || loading}
            className="w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-[hsl(43_96%_56%_/_0.45)] disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {errorMessage ? (
          <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {errorMessage}
          </div>
        ) : null}
      </div>

      <div className="grid gap-3 border-t border-white/10 bg-zinc-950 p-5">
        <button
          onClick={onSaveTime}
          disabled={loading || !canReschedule}
          className="premium-button rounded-2xl px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Salvando..." : "Salvar novo horário"}
        </button>

        <button
          onClick={onCheckout}
          disabled={loading || !canCheckout}
          className="rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Processando..." : "Fazer checkout"}
        </button>
      </div>
    </div>
  );
}

export default function BookingDrawer({ booking, onClose }: Props) {
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (booking) {
      setDate(toLocalInputValue(booking.date));
      setErrorMessage(null);
    }
  }, [booking]);

  const isOpen = useMemo(() => !!booking, [booking]);

  async function handleSaveTime() {
    if (!booking) return;

    try {
      setLoading(true);
      setErrorMessage(null);

      const res = await fetch(`/api/v1/bookings/${booking.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: new Date(date).toISOString(),
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Erro ao atualizar horário.");
      }

      window.location.reload();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar o horário."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckout() {
    if (!booking) return;

    try {
      setLoading(true);
      setErrorMessage(null);

      const res = await fetch(`/api/v1/bookings/${booking.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "COMPLETED",
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Erro ao finalizar atendimento.");
      }

      window.location.reload();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível finalizar o atendimento."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="xl:hidden">
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
          <SheetContent
            side="bottom"
            className="h-[88vh] rounded-t-[28px] border-white/10 bg-zinc-950 p-0 text-white"
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Detalhes do agendamento</SheetTitle>
            </SheetHeader>

            {booking ? (
              <BookingDetailsContent
                booking={booking}
                date={date}
                setDate={setDate}
                loading={loading}
                errorMessage={errorMessage}
                onSaveTime={handleSaveTime}
                onCheckout={handleCheckout}
              />
            ) : null}
          </SheetContent>
        </Sheet>
      </div>

      {booking && (
        <aside className="hidden w-[420px] shrink-0 border-l border-white/10 bg-zinc-950 xl:block">
          <BookingDetailsContent
            booking={booking}
            date={date}
            setDate={setDate}
            loading={loading}
            errorMessage={errorMessage}
            onClose={onClose}
            onSaveTime={handleSaveTime}
            onCheckout={handleCheckout}
          />
        </aside>
      )}
    </>
  );
}