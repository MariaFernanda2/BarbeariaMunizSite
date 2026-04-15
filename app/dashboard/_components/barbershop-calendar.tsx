"use client";

import { useMemo, useState } from "react";
import BookingDrawer from "./booking-drawer";
import {
  APP_TIME_ZONE,
  buildUtcDateFromLocalSelection,
  formatBookingInAppTimeZone,
} from "@/app/lib/utils/timezone";

type Barber = {
  id: string;
  name: string;
  imageUrl?: string | null;
  barbershopId?: string;
};

type Booking = {
  id: string;
  date: string | Date;
  status: "CONFIRMED" | "COMPLETED" | "CANCELED";
  barberId: string;
  barber: {
    id: string;
    name: string;
    imageUrl?: string | null;
    barbershopId?: string;
  };
  user: {
    id: string;
    name: string | null;
  };
  service: {
    id: string;
    name: string;
    price: any;
  };
};

type ScheduleBlock = {
  id: string;
  barberId: string;
  startDate: string | Date;
  endDate: string | Date;
  reason?: string | null;
};

type CalendarEvent =
  | {
      type: "booking";
      data: Booking;
      start: Date;
      end: Date;
    }
  | {
      type: "block";
      data: ScheduleBlock;
      start: Date;
      end: Date;
    };

interface Props {
  barbers: Barber[];
  bookings: Booking[];
  services: {
    id: string;
    name: string;
    price: any;
    description?: string;
    imageUrl?: string;
  }[];
  scheduleBlocks: ScheduleBlock[];
  barbershopId: string;
  currentBarberId: string;
  defaultOpenCreateBooking?: boolean;
}

const START_HOUR = 9;
const END_HOUR = 20;
const HOUR_HEIGHT = 92;
const BOOKING_CARD_HEIGHT = 74;
const MIN_BLOCK_HEIGHT = 50;

function formatHour(hour: number) {
  return `${String(hour).padStart(2, "0")}:00`;
}

function formatTime(date: Date | string) {
  return formatBookingInAppTimeZone(date, "HH:mm", APP_TIME_ZONE);
}

function toDatetimeLocal(date: Date | string) {
  return formatBookingInAppTimeZone(
    date,
    "yyyy-MM-dd'T'HH:mm",
    APP_TIME_ZONE
  );
}

function parseDatetimeLocalToUtc(value: string) {
  const [datePart, timePart] = value.split("T");

  if (!datePart || !timePart) {
    throw new Error("Data/hora inválida.");
  }

  const [year, month, day] = datePart.split("-").map(Number);
  const selectedDate = new Date(year, month - 1, day);

  return buildUtcDateFromLocalSelection(
    selectedDate,
    timePart,
    APP_TIME_ZONE
  );
}

function getTopFromDate(date: Date) {
  const hours = Number(formatBookingInAppTimeZone(date, "H", APP_TIME_ZONE));
  const minutes = Number(formatBookingInAppTimeZone(date, "m", APP_TIME_ZONE));

  return (hours - START_HOUR) * HOUR_HEIGHT + (minutes / 60) * HOUR_HEIGHT;
}

function getHeightFromRange(start: Date, end: Date) {
  const diffInMinutes = Math.max(
    30,
    Math.round((end.getTime() - start.getTime()) / (1000 * 60))
  );

  const height = (diffInMinutes / 60) * HOUR_HEIGHT;
  return Math.max(height, MIN_BLOCK_HEIGHT);
}

function getBookingStatusClasses(status: Booking["status"]) {
  switch (status) {
    case "COMPLETED":
      return "border-emerald-400/60 bg-emerald-500/20 text-emerald-50";
    case "CANCELED":
      return "border-red-400/60 bg-red-500/20 text-red-50";
    default:
      return "border-lime-400/60 bg-lime-500/20 text-lime-50";
  }
}

function getBlockClasses() {
  return "border-zinc-500/80 bg-zinc-500/30 text-zinc-100";
}

function getBookingStatusLabel(status: Booking["status"]) {
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

function startOfDay(date: Date) {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
}

function endOfDay(date: Date) {
  const newDate = new Date(date);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
}

function addDays(date: Date, amount: number) {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + amount);
  return newDate;
}

function isDateInRange(date: Date, start: Date, end: Date) {
  return date >= start && date <= end;
}

function formatVisibleDate(currentDate: Date) {
  return currentDate
    .toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
    .replace(".", "");
}

function getViewSubtitle(currentDate: Date) {
  return currentDate.toLocaleDateString("pt-BR", {
    weekday: "long",
  });
}

export default function BarbershopCalendar({
  barbers,
  bookings,
  services,
  scheduleBlocks,
  barbershopId,
  currentBarberId,
}: Props) {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [openActionMenuBarberId, setOpenActionMenuBarberId] = useState<string | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);

  const [selectedBarberId, setSelectedBarberId] = useState(currentBarberId);
  const [selectedDateTime, setSelectedDateTime] = useState("");
  const [clientName, setClientName] = useState("");
  const [serviceId, setServiceId] = useState("");

  const [blockStartDateTime, setBlockStartDateTime] = useState("");
  const [blockEndDateTime, setBlockEndDateTime] = useState("");
  const [blockReason, setBlockReason] = useState("");

  const [isSavingCreate, setIsSavingCreate] = useState(false);
  const [isSavingBlock, setIsSavingBlock] = useState(false);

  const [currentDate, setCurrentDate] = useState(new Date());

  const hours = useMemo(() => {
    return Array.from(
      { length: END_HOUR - START_HOUR + 1 },
      (_, index) => START_HOUR + index
    );
  }, []);

  const visibleRange = useMemo(() => {
    return {
      start: startOfDay(currentDate),
      end: endOfDay(currentDate),
    };
  }, [currentDate]);

  const groupedEvents = useMemo(() => {
    return (barbers ?? []).map((barber) => {
      const barberBookings: CalendarEvent[] = (bookings ?? [])
        .filter((booking) => booking.barberId === barber.id)
        .map((booking) => {
          const start = new Date(booking.date);
          const end = new Date(start);
          end.setMinutes(end.getMinutes() + 50);

          return {
            type: "booking" as const,
            data: booking,
            start,
            end,
          };
        })
        .filter((event) =>
          isDateInRange(event.start, visibleRange.start, visibleRange.end)
        );

      const barberBlocks: CalendarEvent[] = (scheduleBlocks ?? [])
        .filter((block) => block.barberId === barber.id)
        .map((block) => ({
          type: "block" as const,
          data: block,
          start: new Date(block.startDate),
          end: new Date(block.endDate),
        }))
        .filter((event) =>
          isDateInRange(event.start, visibleRange.start, visibleRange.end)
        );

      const events = [...barberBookings, ...barberBlocks].sort(
        (a, b) => a.start.getTime() - b.start.getTime()
      );

      return {
        barber,
        events,
      };
    });
  }, [barbers, bookings, scheduleBlocks, visibleRange]);

  function toggleActionMenu(barberId: string) {
    setOpenActionMenuBarberId((current) =>
      current === barberId ? null : barberId
    );
  }

  function handlePrevious() {
    setCurrentDate((prev) => addDays(prev, -1));
  }

  function handleNext() {
    setCurrentDate((prev) => addDays(prev, 1));
  }

  function openCreateModal(barberId: string, date?: Date) {
    setSelectedBarberId(barberId);
    setSelectedDateTime(date ? toDatetimeLocal(date) : "");
    setClientName("");
    setServiceId("");
    setOpenActionMenuBarberId(null);
    setIsCreateModalOpen(true);
  }

  function closeCreateModal() {
    setIsCreateModalOpen(false);
    setSelectedBarberId(currentBarberId);
    setSelectedDateTime("");
    setClientName("");
    setServiceId("");
  }

  function openBlockModal(barberId: string, date?: Date) {
    setSelectedBarberId(barberId);

    if (date) {
      const start = toDatetimeLocal(date);
      const endDate = new Date(date);
      endDate.setHours(endDate.getHours() + 1);

      setBlockStartDateTime(start);
      setBlockEndDateTime(toDatetimeLocal(endDate));
    } else {
      setBlockStartDateTime("");
      setBlockEndDateTime("");
    }

    setBlockReason("");
    setOpenActionMenuBarberId(null);
    setIsBlockModalOpen(true);
  }

  function closeBlockModal() {
    setIsBlockModalOpen(false);
    setSelectedBarberId(currentBarberId);
    setBlockStartDateTime("");
    setBlockEndDateTime("");
    setBlockReason("");
  }

  async function handleCreateBooking(e: React.FormEvent) {
    e.preventDefault();

    try {
      setIsSavingCreate(true);

      const utcDate = parseDatetimeLocalToUtc(selectedDateTime);

      const response = await fetch("/api/v1/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          barberId: selectedBarberId,
          barbershopId,
          clientName,
          serviceId,
          date: utcDate.toISOString(),
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || "Erro ao criar agendamento.");
      }

      closeCreateModal();
      window.location.reload();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro ao criar agendamento.");
    } finally {
      setIsSavingCreate(false);
    }
  }

  async function handleCreateBlock(e: React.FormEvent) {
    e.preventDefault();

    try {
      setIsSavingBlock(true);

      const utcStartDate = parseDatetimeLocalToUtc(blockStartDateTime);
      const utcEndDate = parseDatetimeLocalToUtc(blockEndDateTime);

      const response = await fetch("/api/v1/schedule-blocks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          barberId: selectedBarberId,
          barbershopId,
          startDate: utcStartDate.toISOString(),
          endDate: utcEndDate.toISOString(),
          reason: blockReason,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || "Erro ao criar bloqueio.");
      }

      closeBlockModal();
      window.location.reload();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro ao criar bloqueio.");
    } finally {
      setIsSavingBlock(false);
    }
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <button type="button" onClick={handlePrevious} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-zinc-300 bg-white text-2xl text-zinc-700 shadow-sm transition hover:bg-zinc-100">
            ‹
          </button>

          <div className="flex-1 rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-center shadow-sm">
            <p className="text-base font-bold text-zinc-900 sm:text-lg">
              {formatVisibleDate(currentDate)}
            </p>
            <p className="text-sm capitalize text-zinc-500">
              {getViewSubtitle(currentDate)}
            </p>
          </div>

          <button type="button" onClick={handleNext} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-zinc-300 bg-white text-2xl text-zinc-700 shadow-sm transition hover:bg-zinc-100">
            ›
          </button>
        </div>

        <div className="lg:hidden">
          <div className="space-y-4">
            {groupedEvents.map(({ barber, events }) => (
              <div key={barber.id} className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 shadow-lg">
                <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-4">
                  <div className="flex min-w-0 items-center gap-3">
                    {barber.imageUrl ? (
                      <img src={barber.imageUrl} alt={barber.name} className="h-11 w-11 rounded-full border border-zinc-700 object-cover" />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-sm font-bold text-white">
                        {barber.name?.[0] ?? "B"}
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="truncate font-semibold text-white">{barber.name}</p>
                      <p className="text-xs text-zinc-400">Agenda do dia</p>
                    </div>
                  </div>

                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleActionMenu(barber.id)}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-lg font-bold text-white transition hover:bg-zinc-700"
                    >
                      +
                    </button>

                    {openActionMenuBarberId === barber.id && (
                      <div className="absolute right-0 top-12 z-30 w-56 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl">
                        <button type="button" onClick={() => openCreateModal(barber.id)} className="flex w-full items-center px-4 py-3 text-left text-sm text-white transition hover:bg-zinc-900">
                          Novo agendamento
                        </button>

                        <button type="button" onClick={() => openBlockModal(barber.id)} className="flex w-full items-center px-4 py-3 text-left text-sm text-white transition hover:bg-zinc-900">
                          Bloqueio de agenda
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3 p-4">
                  {events.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/50 px-4 py-6 text-center text-sm text-zinc-400">
                      Nenhum horário neste dia
                    </div>
                  ) : (
                    events.map((event) => {
                      if (event.type === "booking") {
                        const booking = event.data;

                        return (
                          <button
                            key={booking.id}
                            onClick={() => setSelectedBooking(booking)}
                            className={`w-full rounded-2xl border p-4 text-left shadow-lg ${getBookingStatusClasses(booking.status)}`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-xs font-medium opacity-80">
                                  {formatTime(event.start)}
                                </p>
                                <p className="mt-1 truncate text-sm font-bold">
                                  {booking.user.name || "Cliente"}
                                </p>
                                <p className="truncate text-xs opacity-90">
                                  {booking.service.name}
                                </p>
                              </div>

                              <span className="shrink-0 rounded-full bg-black/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide">
                                {getBookingStatusLabel(booking.status)}
                              </span>
                            </div>
                          </button>
                        );
                      }

                      const block = event.data;

                      return (
                        <div key={block.id} className={`w-full rounded-2xl border p-4 text-left shadow-lg ${getBlockClasses()}`}>
                          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-200">
                            Bloqueado
                          </p>
                          <p className="mt-1 text-sm font-bold text-white">
                            {block.reason || "Horário indisponível"}
                          </p>
                          <p className="mt-2 text-xs text-zinc-200">
                            {formatTime(event.start)} - {formatTime(event.end)}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden lg:block">
          <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 shadow-2xl">
            <div className="flex h-[calc(100vh-180px)] min-h-[720px] overflow-hidden">
              <div className="flex-1 overflow-auto">
                <div className="min-w-[1100px]">
                  <div
                    className="sticky top-0 z-20 grid border-b border-zinc-800 bg-zinc-950/95 backdrop-blur"
                    style={{
                      gridTemplateColumns: `80px repeat(${groupedEvents.length}, minmax(240px, 1fr))`,
                    }}
                  >
                    <div className="border-r border-zinc-800 px-4 py-4" />

                    {groupedEvents.map(({ barber }) => (
                      <div key={barber.id} className="border-r border-zinc-800 px-4 py-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            {barber.imageUrl ? (
                              <img src={barber.imageUrl} alt={barber.name} className="h-11 w-11 rounded-full border border-zinc-700 object-cover" />
                            ) : (
                              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-sm font-bold">
                                {barber.name?.[0] ?? "B"}
                              </div>
                            )}

                            <div className="min-w-0">
                              <p className="truncate font-semibold text-white">{barber.name}</p>
                              <p className="text-xs text-zinc-400">Agenda do dia • 09:00 às 20:00</p>
                            </div>
                          </div>

                          <div className="relative shrink-0">
                            <button
                              type="button"
                              onClick={() => toggleActionMenu(barber.id)}
                              className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-lg font-bold text-white transition hover:bg-zinc-700"
                            >
                              +
                            </button>

                            {openActionMenuBarberId === barber.id && (
                              <div className="absolute right-0 top-12 z-30 w-56 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl">
                                <button type="button" onClick={() => openCreateModal(barber.id)} className="flex w-full items-center px-4 py-3 text-left text-sm text-white transition hover:bg-zinc-900">
                                  Novo agendamento
                                </button>

                                <button type="button" onClick={() => openBlockModal(barber.id)} className="flex w-full items-center px-4 py-3 text-left text-sm text-white transition hover:bg-zinc-900">
                                  Bloqueio de agenda
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div
                    className="grid"
                    style={{
                      gridTemplateColumns: `80px repeat(${groupedEvents.length}, minmax(240px, 1fr))`,
                    }}
                  >
                    <div className="relative border-r border-zinc-800 bg-zinc-950">
                      {hours.map((hour) => (
                        <div
                          key={hour}
                          className="border-b border-dashed border-zinc-800 px-3 pt-2 text-xs font-medium text-zinc-500"
                          style={{ height: HOUR_HEIGHT }}
                        >
                          {formatHour(hour)}
                        </div>
                      ))}
                    </div>

                    {groupedEvents.map(({ barber, events }) => (
                      <div
                        key={barber.id}
                        className="relative border-r border-zinc-800 bg-zinc-900/60"
                        style={{ height: hours.length * HOUR_HEIGHT }}
                      >
                        {hours.map((hour) => (
                          <button
                            key={`${barber.id}-${hour}`}
                            type="button"
                            onClick={() => toggleActionMenu(barber.id)}
                            className="block w-full border-b border-dashed border-zinc-800 text-left transition hover:bg-zinc-800/40"
                            style={{ height: HOUR_HEIGHT }}
                          />
                        ))}

                        {events.map((event) => {
                          const top = getTopFromDate(event.start);

                          if (event.type === "booking") {
                            const booking = event.data;

                            return (
                              <button
                                key={booking.id}
                                onClick={() => setSelectedBooking(booking)}
                                className={`absolute left-2 right-2 rounded-2xl border p-3 text-left shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl ${getBookingStatusClasses(booking.status)}`}
                                style={{
                                  top,
                                  height: BOOKING_CARD_HEIGHT,
                                }}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <p className="text-xs font-medium opacity-80">
                                      {formatTime(event.start)}
                                    </p>
                                    <p className="truncate text-sm font-bold">
                                      {booking.user.name || "Cliente"}
                                    </p>
                                    <p className="truncate text-xs opacity-90">
                                      {booking.service.name}
                                    </p>
                                  </div>

                                  <span className="shrink-0 rounded-full bg-black/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide">
                                    {getBookingStatusLabel(booking.status)}
                                  </span>
                                </div>
                              </button>
                            );
                          }

                          const block = event.data;
                          const height = getHeightFromRange(event.start, event.end);

                          return (
                            <div
                              key={block.id}
                              className={`absolute left-2 right-2 rounded-2xl border p-3 text-left shadow-lg ${getBlockClasses()}`}
                              style={{
                                top,
                                height,
                              }}
                            >
                              <div className="flex h-full flex-col justify-between gap-2">
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-200">
                                    Bloqueado
                                  </p>
                                  <p className="mt-1 text-sm font-bold text-white">
                                    {block.reason || "Horário indisponível"}
                                  </p>
                                </div>

                                <p className="text-xs text-zinc-200">
                                  {formatTime(event.start)} - {formatTime(event.end)}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <BookingDrawer booking={selectedBooking} onClose={() => setSelectedBooking(null)} />
            </div>
          </div>
        </div>
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">Novo agendamento</h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Crie um horário para você ou para outro barbeiro da unidade.
                </p>
              </div>

              <button type="button" onClick={closeCreateModal} className="rounded-lg px-3 py-1 text-zinc-400 hover:bg-zinc-900 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-200">
                  Barbeiro
                </label>
                <select
                  value={selectedBarberId}
                  onChange={(e) => setSelectedBarberId(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none"
                >
                  {barbers.map((barber) => (
                    <option key={barber.id} value={barber.id}>
                      {barber.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-200">
                  Cliente
                </label>
                <input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Nome do cliente"
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder:text-zinc-500 outline-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-200">
                  Serviço
                </label>

                <div className="relative">
                  <select
                    value={serviceId}
                    onChange={(e) => setServiceId(e.target.value)}
                    className="w-full appearance-none rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 pr-12 text-white outline-none transition hover:border-zinc-600 focus:border-white"
                    required
                  >
                    <option value="" disabled>
                      Selecione um serviço
                    </option>

                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name} — R$ {Number(service.price).toFixed(2)}
                      </option>
                    ))}
                  </select>

                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400">
                    ▾
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-200">
                  Data e hora
                </label>
                <input
                  type="datetime-local"
                  value={selectedDateTime}
                  onChange={(e) => setSelectedDateTime(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeCreateModal} className="rounded-2xl border border-zinc-700 px-4 py-3 text-sm font-semibold text-zinc-200 transition hover:bg-zinc-900">
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSavingCreate}
                  className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-50"
                >
                  {isSavingCreate ? "Salvando..." : "Criar agendamento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isBlockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">Bloqueio de agenda</h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Bloqueie um período para impedir novos agendamentos.
                </p>
              </div>

              <button type="button" onClick={closeBlockModal} className="rounded-lg px-3 py-1 text-zinc-400 hover:bg-zinc-900 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBlock} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-200">
                  Barbeiro
                </label>
                <select
                  value={selectedBarberId}
                  onChange={(e) => setSelectedBarberId(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none"
                >
                  {barbers.map((barber) => (
                    <option key={barber.id} value={barber.id}>
                      {barber.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-200">
                  Início do bloqueio
                </label>
                <input
                  type="datetime-local"
                  value={blockStartDateTime}
                  onChange={(e) => setBlockStartDateTime(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-200">
                  Fim do bloqueio
                </label>
                <input
                  type="datetime-local"
                  value={blockEndDateTime}
                  onChange={(e) => setBlockEndDateTime(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-200">
                  Motivo
                </label>
                <textarea
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="Ex: almoço, curso, reunião, folga..."
                  className="min-h-[110px] w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder:text-zinc-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeBlockModal} className="rounded-2xl border border-zinc-700 px-4 py-3 text-sm font-semibold text-zinc-200 transition hover:bg-zinc-900">
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSavingBlock}
                  className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-50"
                >
                  {isSavingBlock ? "Salvando..." : "Salvar bloqueio"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}