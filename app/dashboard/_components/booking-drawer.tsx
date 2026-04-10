"use client";

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/app/_components/ui/sheet";

type Booking = {
  id: string;
  date: string | Date;
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
      return "bg-lime-950 text-lime-300 border border-lime-800";
    case "COMPLETED":
      return "bg-emerald-950 text-emerald-300 border border-emerald-800";
    case "CANCELED":
      return "bg-red-950 text-red-300 border border-red-800";
    default:
      return "bg-zinc-900 text-zinc-300 border border-zinc-700";
  }
}

function BookingDetailsContent({
  booking,
  date,
  setDate,
  loading,
  onClose,
  onSaveTime,
  onCheckout,
}: {
  booking: Booking;
  date: string;
  setDate: (value: string) => void;
  loading: boolean;
  onClose?: () => void;
  onSaveTime: () => void;
  onCheckout: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-zinc-800 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-zinc-500">
              Detalhes do agendamento
            </p>
            <h2 className="mt-1 text-xl font-bold text-white">
              {booking.user.name || "Cliente"}
            </h2>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white hover:bg-zinc-800"
            >
              Fechar
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-5">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Serviço
              </p>
              <p className="mt-1 font-semibold text-white">
                {booking.service.name}
              </p>
            </div>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                booking.status
              )}`}
            >
              {getStatusLabel(booking.status)}
            </span>
          </div>

          <div className="mt-4 grid gap-3 text-sm text-zinc-300">
            <p>
              <span className="text-zinc-500">Barbeiro:</span>{" "}
              {booking.barber.name}
            </p>
            <p>
              <span className="text-zinc-500">Horário atual:</span>{" "}
              {new Date(booking.date).toLocaleString("pt-BR")}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <label className="mb-2 block text-sm font-medium text-white">
            Editar horário
          </label>
          <input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-zinc-500"
          />
        </div>
      </div>

      <div className="grid gap-3 border-t border-zinc-800 bg-zinc-950 p-5">
        <button
          onClick={onSaveTime}
          disabled={loading}
          className="rounded-2xl bg-amber-400 px-4 py-3 font-semibold text-black transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Salvando..." : "Salvar novo horário"}
        </button>

        <button
          onClick={onCheckout}
          disabled={loading}
          className="rounded-2xl bg-emerald-400 px-4 py-3 font-semibold text-black transition hover:opacity-90 disabled:opacity-60"
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

  useEffect(() => {
    if (booking) {
      setDate(toLocalInputValue(booking.date));
    }
  }, [booking]);

  async function handleSaveTime() {
    if (!booking) return;

    try {
      setLoading(true);

      const res = await fetch(`/api/v1/bookings/${booking.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: new Date(date).toISOString(),
        }),
      });

      if (!res.ok) {
        throw new Error("Erro ao atualizar horário");
      }

      window.location.reload();
    } catch {
      alert("Não foi possível atualizar o horário.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckout() {
    if (!booking) return;

    try {
      setLoading(true);

      const res = await fetch(`/api/v1/bookings/${booking.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "COMPLETED",
        }),
      });

      if (!res.ok) {
        throw new Error("Erro ao finalizar atendimento");
      }

      window.location.reload();
    } catch {
      alert("Não foi possível finalizar o atendimento.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="xl:hidden">
        <Sheet open={!!booking} onOpenChange={(open) => !open && onClose()}>
          <SheetContent
            side="bottom"
            className="h-[85vh] rounded-t-3xl border-zinc-800 bg-zinc-950 p-0 text-white"
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
                onSaveTime={handleSaveTime}
                onCheckout={handleCheckout}
              />
            ) : null}
          </SheetContent>
        </Sheet>
      </div>

      {booking && (
        <aside className="hidden w-[400px] shrink-0 border-l border-zinc-800 bg-zinc-950 xl:block">
          <BookingDetailsContent
            booking={booking}
            date={date}
            setDate={setDate}
            loading={loading}
            onClose={onClose}
            onSaveTime={handleSaveTime}
            onCheckout={handleCheckout}
          />
        </aside>
      )}
    </>
  );
}