"use client";

import { useMemo, useState } from "react";
import BookingDrawer from "./booking-drawer";
import {
  APP_TIME_ZONE,
  buildUtcDateFromLocalSelection,
  formatBookingInAppTimeZone,
} from "@/app/lib/utils/timezone";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";

type Barber = {
  id: string;
  name: string;
  imageUrl?: string | null;
  barbershopId?: string;
};

type Booking = {
  id: string;
  date: string | Date;
  endDate: string | Date;
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
  } | null;
  service: {
    id: string;
    name: string;
    price: any;
    durationInMinutes?: number | null;
  };
  clientName?: string | null;
  clientPhone?: string | null;
  paymentMethod?: "CARD" | "CASH" | "PIX" | null;
  finalPrice?: number | string | null;
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
    id: string;
    type: "booking";
    data: Booking;
    start: Date;
    end: Date;
  }
  | {
    id: string;
    type: "block";
    data: ScheduleBlock;
    start: Date;
    end: Date;
  };

type EventWithLayout = CalendarEvent & {
  lane: number;
  lanes: number;
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
    durationInMinutes?: number | null;
  }[];
  scheduleBlocks: ScheduleBlock[];
  barbershopId: string;
  currentBarberId: string;
  defaultOpenCreateBooking?: boolean;
}

const START_HOUR = 8;
const WEEKDAY_LAST_START_HOUR = 20;
const WEEKDAY_CLOSE_HOUR = 21;
const SATURDAY_LAST_START_HOUR = 21;
const SATURDAY_CLOSE_HOUR = 22;
const CALENDAR_END_HOUR = 22;
const HOUR_HEIGHT = 88;
const MIN_EVENT_HEIGHT = 44;
const DESKTOP_COLUMN_MIN_WIDTH = 300;

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

  return buildUtcDateFromLocalSelection(selectedDate, timePart, APP_TIME_ZONE);
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 2) return digits;
  if (digits.length <= 7) {
    return digits.replace(/^(\d{2})(\d+)/, "($1) $2");
  }

  return digits.replace(/^(\d{2})(\d{5})(\d+)/, "($1) $2-$3");
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

function formatVisibleDate(currentDate: Date) {
  return currentDate
    .toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    .replace(".", "");
}

function getViewSubtitle(currentDate: Date) {
  return currentDate.toLocaleDateString("pt-BR", {
    weekday: "long",
  });
}

function getMinutesFromAppDay(date: Date) {
  const hours = Number(formatBookingInAppTimeZone(date, "H", APP_TIME_ZONE));
  const minutes = Number(formatBookingInAppTimeZone(date, "m", APP_TIME_ZONE));

  return hours * 60 + minutes;
}

function getTopFromDate(date: Date) {
  const minutesFromDayStart = getMinutesFromAppDay(date) - START_HOUR * 60;
  return (minutesFromDayStart / 60) * HOUR_HEIGHT;
}

function getHeightFromRange(start: Date, end: Date) {
  const diffInMinutes = Math.max(
    5,
    Math.round((end.getTime() - start.getTime()) / (1000 * 60))
  );

  const height = (diffInMinutes / 60) * HOUR_HEIGHT;
  return Math.max(height, MIN_EVENT_HEIGHT);
}

function intersectsDay(start: Date, end: Date, day: Date) {
  const dayStart = startOfDay(day);
  const dayEnd = endOfDay(day);
  return start <= dayEnd && end >= dayStart;
}

function getScheduleLimits(date: Date) {
  const weekday = Number(formatBookingInAppTimeZone(date, "i", APP_TIME_ZONE));
  const isSaturday = weekday === 6;
  const isSunday = weekday === 7;

  return {
    isSaturday,
    isSunday,
    startHour: START_HOUR,
    lastStartHour: isSaturday ? SATURDAY_LAST_START_HOUR : WEEKDAY_LAST_START_HOUR,
    closeHour: isSaturday ? SATURDAY_CLOSE_HOUR : WEEKDAY_CLOSE_HOUR,
    label: isSaturday ? "08:00 às 22:00" : "08:00 às 21:00",
    lastStartLabel: isSaturday ? "21:00" : "20:00",
  };
}

function validateBookingSchedule(date: Date, durationInMinutes: number) {
  const limits = getScheduleLimits(date);

  if (limits.isSunday) {
    throw new Error("A barbearia não recebe agendamentos aos domingos.");
  }

  const hour = Number(formatBookingInAppTimeZone(date, "H", APP_TIME_ZONE));
  const minute = Number(formatBookingInAppTimeZone(date, "m", APP_TIME_ZONE));
  const startMinutes = hour * 60 + minute;
  const minStartMinutes = limits.startHour * 60;
  const maxStartMinutes = limits.lastStartHour * 60;
  const closeMinutes = limits.closeHour * 60;
  const endMinutes = startMinutes + durationInMinutes;

  if (startMinutes < minStartMinutes) {
    throw new Error("O agendamento só pode iniciar a partir das 08:00.");
  }

  if (startMinutes > maxStartMinutes) {
    throw new Error(
      limits.isSaturday
        ? "Aos sábados, o último horário de início é 21:00."
        : "De segunda a sexta, o último horário de início é 20:00."
    );
  }

  if (endMinutes > closeMinutes) {
    throw new Error(
      limits.isSaturday
        ? "Aos sábados, o atendimento precisa terminar até 22:00."
        : "De segunda a sexta, o atendimento precisa terminar até 21:00."
    );
  }
}

function clampEventToVisibleHours(start: Date, end: Date, visibleDate: Date) {
  const day = formatBookingInAppTimeZone(
    visibleDate,
    "yyyy-MM-dd",
    APP_TIME_ZONE
  );

  const visibleStart = buildUtcDateFromLocalSelection(
    new Date(`${day}T00:00:00`),
    `${String(START_HOUR).padStart(2, "0")}:00`,
    APP_TIME_ZONE
  );
  const visibleEnd = buildUtcDateFromLocalSelection(
    new Date(`${day}T00:00:00`),
    `${String(CALENDAR_END_HOUR).padStart(2, "0")}:00`,
    APP_TIME_ZONE
  );

  const clampedStart = new Date(
    Math.max(start.getTime(), visibleStart.getTime())
  );
  const clampedEnd = new Date(Math.min(end.getTime(), visibleEnd.getTime()));

  return {
    start: clampedStart,
    end: clampedEnd,
  };
}

function getBookingStatusClasses(status: Booking["status"]) {
  switch (status) {
    case "COMPLETED":
      return {
        card: "border-emerald-400/40 bg-emerald-500/15 text-emerald-50",
        badge: "bg-emerald-400/15 text-emerald-100 border border-emerald-300/20",
      };
    case "CANCELED":
      return {
        card: "border-red-400/40 bg-red-500/15 text-red-50",
        badge: "bg-red-400/15 text-red-100 border border-red-300/20",
      };
    default:
      return {
        card: "border-[hsl(43_96%_56%_/_0.45)] bg-[hsl(43_96%_56%_/_0.14)] text-white",
        badge: "bg-[hsl(43_96%_56%_/_0.16)] text-[hsl(43_96%_56%)] border border-[hsl(43_96%_56%_/_0.24)]",
      };
  }
}

function getBlockClasses() {
  return {
    card: "border-zinc-500/40 bg-zinc-500/20 text-zinc-100",
    badge: "bg-zinc-400/10 text-zinc-200 border border-zinc-400/20",
  };
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

function buildTimeSlots(currentDate: Date) {
  const slots: Date[] = [];

  const dateKey = formatBookingInAppTimeZone(
    currentDate,
    "yyyy-MM-dd",
    APP_TIME_ZONE
  );
  const [year, month, day] = dateKey.split("-").map(Number);
  const base = new Date(year, month - 1, day);
  base.setHours(START_HOUR, 0, 0, 0);

  const end = new Date(year, month - 1, day);
  end.setHours(CALENDAR_END_HOUR, 0, 0, 0);

  while (base < end) {
    slots.push(new Date(base));
    base.setMinutes(base.getMinutes() + 30);
  }

  return slots;
}

function getServiceDurationInMinutes(service?: { durationInMinutes?: number | null }) {
  const duration = Number(service?.durationInMinutes ?? 60);

  if (!Number.isFinite(duration) || duration <= 0) {
    return 60;
  }

  return Math.max(5, Math.round(duration));
}

function buildLocalDateString(date: Date) {
  return formatBookingInAppTimeZone(date, "yyyy-MM-dd", APP_TIME_ZONE);
}

function buildLocalTimeString(date: Date) {
  return formatBookingInAppTimeZone(date, "HH:mm", APP_TIME_ZONE);
}

function getAvailableHours(params: {
  selectedDate: string;
  selectedBarberId: string;
  serviceId: string;
  services: Props["services"];
  bookings: Booking[];
  scheduleBlocks: ScheduleBlock[];
}) {
  if (!params.selectedDate || !params.selectedBarberId || !params.serviceId) {
    return [];
  }

  const selectedService = params.services.find(
    (service) => service.id === params.serviceId
  );

  if (!selectedService) {
    return [];
  }

  const durationInMinutes = getServiceDurationInMinutes(selectedService);
  const selectedDay = parseDatetimeLocalToUtc(`${params.selectedDate}T00:00`);
  const limits = getScheduleLimits(selectedDay);

  if (limits.isSunday) {
    return [];
  }

  const availableHours: string[] = [];
  const startMinutes = limits.startHour * 60;
  const lastStartMinutes = limits.lastStartHour * 60;
  const closeMinutes = limits.closeHour * 60;

  for (
    let currentMinutes = startMinutes;
    currentMinutes <= lastStartMinutes;
    currentMinutes += durationInMinutes
  ) {
    const endMinutes = currentMinutes + durationInMinutes;

    if (endMinutes > closeMinutes) {
      continue;
    }

    const hour = Math.floor(currentMinutes / 60);
    const minute = currentMinutes % 60;
    const time = `${String(hour).padStart(2, "0")}:${String(minute).padStart(
      2,
      "0"
    )}`;

    const startDate = parseDatetimeLocalToUtc(`${params.selectedDate}T${time}`);
    const endDate = addMinutes(startDate, durationInMinutes);

    const hasBookingConflict = params.bookings.some((booking) => {
      if (booking.barberId !== params.selectedBarberId) return false;
      if (booking.status === "CANCELED") return false;

      const bookingStart = new Date(booking.date);
      const bookingEnd = new Date(booking.endDate);

      return startDate < bookingEnd && endDate > bookingStart;
    });

    const hasBlockConflict = params.scheduleBlocks.some((block) => {
      if (block.barberId !== params.selectedBarberId) return false;

      const blockStart = new Date(block.startDate);
      const blockEnd = new Date(block.endDate);

      return startDate < blockEnd && endDate > blockStart;
    });

    if (!hasBookingConflict && !hasBlockConflict) {
      availableHours.push(time);
    }
  }

  return availableHours;
}

function layoutEvents(events: CalendarEvent[]): EventWithLayout[] {
  const sorted = [...events].sort((a, b) => a.start.getTime() - b.start.getTime());
  const result: EventWithLayout[] = [];

  const groups: CalendarEvent[][] = [];
  let currentGroup: CalendarEvent[] = [];
  let currentGroupEnd = 0;

  for (const event of sorted) {
    if (currentGroup.length === 0) {
      currentGroup = [event];
      currentGroupEnd = event.end.getTime();
      continue;
    }

    if (event.start.getTime() < currentGroupEnd) {
      currentGroup.push(event);
      currentGroupEnd = Math.max(currentGroupEnd, event.end.getTime());
    } else {
      groups.push(currentGroup);
      currentGroup = [event];
      currentGroupEnd = event.end.getTime();
    }
  }

  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  groups.forEach((group) => {
    const laneEndTimes: number[] = [];
    const laidOut: EventWithLayout[] = [];

    group.forEach((event) => {
      let assignedLane = -1;

      for (let i = 0; i < laneEndTimes.length; i++) {
        if (event.start.getTime() >= laneEndTimes[i]) {
          assignedLane = i;
          laneEndTimes[i] = event.end.getTime();
          break;
        }
      }

      if (assignedLane === -1) {
        assignedLane = laneEndTimes.length;
        laneEndTimes.push(event.end.getTime());
      }

      laidOut.push({
        ...event,
        lane: assignedLane,
        lanes: 1,
      });
    });

    const laneCount = Math.max(...laidOut.map((item) => item.lane), 0) + 1;

    laidOut.forEach((item) => {
      result.push({
        ...item,
        lanes: laneCount,
      });
    });
  });

  return result;
}

function BarberAvatar({ barber }: { barber: Barber }) {
  if (barber.imageUrl) {
    return (
      <img
        src={barber.imageUrl}
        alt={barber.name}
        className="h-11 w-11 rounded-2xl border border-white/10 object-cover"
      />
    );
  }

  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm font-bold text-white">
      {barber.name?.[0] ?? "B"}
    </div>
  );
}

export default function BarbershopCalendar({
  barbers,
  bookings,
  services,
  scheduleBlocks,
  barbershopId,
  currentBarberId,
  defaultOpenCreateBooking = false,
}: Props) {
  const [isQuickClient, setIsQuickClient] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [openActionMenuBarberId, setOpenActionMenuBarberId] = useState<string | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(defaultOpenCreateBooking);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);

  const [selectedBarberId, setSelectedBarberId] = useState(currentBarberId);
  const [selectedDateTime, setSelectedDateTime] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedHour, setSelectedHour] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [serviceId, setServiceId] = useState("");

  const [blockStartDateTime, setBlockStartDateTime] = useState("");
  const [blockEndDateTime, setBlockEndDateTime] = useState("");
  const [blockReason, setBlockReason] = useState("");

  const [isSavingCreate, setIsSavingCreate] = useState(false);
  const [isSavingBlock, setIsSavingBlock] = useState(false);

  const [currentDate, setCurrentDate] = useState(new Date());

  const hours = useMemo(
    () =>
      Array.from(
        { length: CALENDAR_END_HOUR - START_HOUR },
        (_, index) => START_HOUR + index
      ),
    []
  );

  const halfHourSlots = useMemo(() => buildTimeSlots(currentDate), [currentDate]);

  const visibleRange = useMemo(
    () => ({
      start: startOfDay(currentDate),
      end: endOfDay(currentDate),
    }),
    [currentDate]
  );

  const daySchedule = useMemo(() => getScheduleLimits(currentDate), [currentDate]);

  const selectedService = useMemo(() => {
    return services.find((service) => service.id === serviceId);
  }, [services, serviceId]);

  const selectedServiceDuration = useMemo(() => {
    return getServiceDurationInMinutes(selectedService);
  }, [selectedService]);

  const availableHours = useMemo(() => {
    return getAvailableHours({
      selectedDate,
      selectedBarberId,
      serviceId,
      services,
      bookings,
      scheduleBlocks,
    });
  }, [
    selectedDate,
    selectedBarberId,
    serviceId,
    services,
    bookings,
    scheduleBlocks,
  ]);

  const previewDate = useMemo(() => {
    if (!selectedDate || !selectedHour) return null;

    return parseDatetimeLocalToUtc(`${selectedDate}T${selectedHour}`);
  }, [selectedDate, selectedHour]);

  const previewEndDate = useMemo(() => {
    if (!previewDate) return null;

    return addMinutes(previewDate, selectedServiceDuration);
  }, [previewDate, selectedServiceDuration]);

  const groupedEvents = useMemo(() => {
    return (barbers ?? []).map((barber) => {
      const barberBookings: CalendarEvent[] = (bookings ?? [])
        .filter((booking) => booking.barberId === barber.id)
        .map((booking) => ({
          id: booking.id,
          type: "booking" as const,
          data: booking,
          start: new Date(booking.date),
          end: new Date(booking.endDate),
        }))
        .filter((event) =>
          intersectsDay(event.start, event.end, visibleRange.start)
        );

      const barberBlocks: CalendarEvent[] = (scheduleBlocks ?? [])
        .filter((block) => block.barberId === barber.id)
        .map((block) => ({
          id: block.id,
          type: "block" as const,
          data: block,
          start: new Date(block.startDate),
          end: new Date(block.endDate),
        }))
        .filter((event) =>
          intersectsDay(event.start, event.end, visibleRange.start)
        );

      const events = layoutEvents([...barberBookings, ...barberBlocks]);

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

  function openCreateModal(
    barberId: string,
    date?: Date,
    shouldPreselectHour = false
  ) {
    const selected = date ?? currentDate;
    const nextDate = buildLocalDateString(selected);
    const nextHour = shouldPreselectHour ? buildLocalTimeString(selected) : "";

    setSelectedBarberId(barberId);
    setSelectedDate(nextDate);
    setSelectedHour(nextHour);
    setSelectedDateTime(nextHour ? `${nextDate}T${nextHour}` : "");
    setClientName("");
    setClientPhone("");
    setServiceId("");
    setIsQuickClient(false);
    setOpenActionMenuBarberId(null);
    setIsCreateModalOpen(true);
  }

  function closeCreateModal() {
    setIsCreateModalOpen(false);
    setSelectedBarberId(currentBarberId);
    setSelectedDateTime("");
    setSelectedDate("");
    setSelectedHour("");
    setClientName("");
    setClientPhone("");
    setServiceId("");
    setIsQuickClient(false);
  }

  function openBlockModal(barberId: string, date?: Date) {
    setSelectedBarberId(barberId);

    if (date) {
      const start = toDatetimeLocal(date);
      const endDate = addMinutes(date, 60);

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

    if (!clientName.trim()) {
      alert("Informe o nome do cliente.");
      return;
    }

    if (!serviceId) {
      alert("Selecione um serviço.");
      return;
    }

    if (!selectedDate || !selectedHour) {
      alert("Selecione a data e o horário disponível.");
      return;
    }

    try {
      setIsSavingCreate(true);

      const selectedService = services.find((service) => service.id === serviceId);
      const durationInMinutes = getServiceDurationInMinutes(selectedService);
      const utcDate = parseDatetimeLocalToUtc(`${selectedDate}T${selectedHour}`);
      const endDate = addMinutes(utcDate, durationInMinutes);

      validateBookingSchedule(utcDate, durationInMinutes);

      const response = await fetch("/api/v1/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          barberId: selectedBarberId,
          barbershopId,
          clientName: clientName.trim(),
          clientPhone: clientPhone.trim() || null,
          serviceId,
          date: utcDate.toISOString(),
          endDate: endDate.toISOString(),
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

      if (utcEndDate <= utcStartDate) {
        throw new Error("O fim do bloqueio precisa ser maior que o início.");
      }

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
          reason: blockReason.trim() || null,
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
      <div className="space-y-5">
        <div className="premium-home-card rounded-[28px] p-4 text-white sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center rounded-full border border-[hsl(43_96%_56%_/_0.22)] bg-[hsl(43_96%_56%_/_0.08)] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[hsl(43_96%_56%)]">
                Agenda diária
              </div>

              <h2 className="mt-3 text-2xl font-bold tracking-tight">
                Agenda da unidade
              </h2>

              <p className="mt-1 text-sm text-zinc-400">
                Segunda a sexta: início até 20:00. Sábado: início até 21:00 e término até 22:00.
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={handlePrevious}
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xl text-white transition hover:bg-white/10"
              >
                ‹
              </button>

              <div className="min-w-[220px] rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-center">
                <p className="text-base font-bold capitalize text-white sm:text-lg">
                  {formatVisibleDate(currentDate)}
                </p>
                <p className="text-sm capitalize text-zinc-400">
                  {getViewSubtitle(currentDate)} • {daySchedule.label}
                </p>
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xl text-white transition hover:bg-white/10"
              >
                ›
              </button>
            </div>
          </div>
        </div>

        <div className="lg:hidden">
          <div className="space-y-4">
            {groupedEvents.map(({ barber, events }) => (
              <div
                key={barber.id}
                className="premium-home-card overflow-hidden rounded-[28px] text-white"
              >
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <BarberAvatar barber={barber} />

                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-white">
                        {barber.name}
                      </p>
                      <p className="text-xs text-zinc-400">
                        Agenda do dia • {daySchedule.label}
                      </p>
                    </div>
                  </div>

                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleActionMenu(barber.id)}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-lg font-bold text-white transition hover:bg-white/10"
                    >
                      +
                    </button>

                    {openActionMenuBarberId === barber.id && (
                      <div className="absolute right-0 top-12 z-30 w-56 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl">
                        <button
                          type="button"
                          onClick={() => openCreateModal(barber.id, currentDate)}
                          className="flex w-full items-center px-4 py-3 text-left text-sm text-white transition hover:bg-white/5"
                        >
                          Novo agendamento
                        </button>

                        <button
                          type="button"
                          onClick={() => openBlockModal(barber.id)}
                          className="flex w-full items-center px-4 py-3 text-left text-sm text-white transition hover:bg-white/5"
                        >
                          Bloqueio de agenda
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3 p-4">
                  {events.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-6 text-center text-sm text-zinc-400">
                      Nenhum horário neste dia
                    </div>
                  ) : (
                    events.map((event) => {
                      if (event.type === "booking") {
                        const booking = event.data;
                        const styles = getBookingStatusClasses(booking.status);

                        return (
                          <button
                            key={booking.id}
                            onClick={() => setSelectedBooking(booking)}
                            className={`w-full rounded-2xl border p-4 text-left shadow-lg transition hover:-translate-y-0.5 ${styles.card}`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-xs font-medium opacity-80">
                                  {formatTime(event.start)} - {formatTime(event.end)}
                                </p>
                                <p className="mt-1 truncate text-sm font-bold">
                                  {booking.clientName || booking.user?.name || "Cliente"}
                                </p>
                                <p className="truncate text-xs opacity-90">
                                  {booking.service.name}
                                </p>
                              </div>

                              <span
                                className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${styles.badge}`}
                              >
                                {getBookingStatusLabel(booking.status)}
                              </span>
                            </div>
                          </button>
                        );
                      }

                      const block = event.data;
                      const styles = getBlockClasses();

                      return (
                        <div
                          key={block.id}
                          className={`w-full rounded-2xl border p-4 text-left shadow-lg ${styles.card}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide">
                                Bloqueado
                              </p>
                              <p className="mt-1 text-sm font-bold">
                                {block.reason || "Horário indisponível"}
                              </p>
                              <p className="mt-2 text-xs opacity-90">
                                {formatTime(event.start)} - {formatTime(event.end)}
                              </p>
                            </div>

                            <span
                              className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${styles.badge}`}
                            >
                              Bloqueio
                            </span>
                          </div>
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
          <div className="overflow-hidden rounded-[32px] border border-white/10 bg-zinc-950 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
            <div className="flex h-[calc(100vh-190px)] min-h-[760px] overflow-hidden">
              <div className="flex-1 overflow-auto">
                <div className="min-w-[1180px]">
                  <div
                    className="sticky top-0 z-20 grid border-b border-white/10 bg-zinc-950/95 backdrop-blur"
                    style={{
                      gridTemplateColumns: `84px repeat(${groupedEvents.length}, minmax(${DESKTOP_COLUMN_MIN_WIDTH}px, 1fr))`,
                    }}
                  >
                    <div className="border-r border-white/10 px-4 py-4" />

                    {groupedEvents.map(({ barber }) => (
                      <div
                        key={barber.id}
                        className="border-r border-white/10 px-5 py-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <BarberAvatar barber={barber} />

                            <div className="min-w-0">
                              <p className="truncate text-base font-semibold text-white">
                                {barber.name}
                              </p>
                              <p className="text-xs text-zinc-400">
                                Agenda do dia • {daySchedule.label}
                              </p>
                            </div>
                          </div>

                          <div className="relative shrink-0">
                            <button
                              type="button"
                              onClick={() => toggleActionMenu(barber.id)}
                              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-lg font-bold text-white transition hover:bg-white/10"
                            >
                              +
                            </button>

                            {openActionMenuBarberId === barber.id && (
                              <div className="absolute right-0 top-12 z-30 w-56 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl">
                                <button
                                  type="button"
                                  onClick={() => openCreateModal(barber.id, currentDate)}
                                  className="flex w-full items-center px-4 py-3 text-left text-sm text-white transition hover:bg-white/5"
                                >
                                  Novo agendamento
                                </button>

                                <button
                                  type="button"
                                  onClick={() => openBlockModal(barber.id)}
                                  className="flex w-full items-center px-4 py-3 text-left text-sm text-white transition hover:bg-white/5"
                                >
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
                      gridTemplateColumns: `84px repeat(${groupedEvents.length}, minmax(${DESKTOP_COLUMN_MIN_WIDTH}px, 1fr))`,
                    }}
                  >
                    <div className="relative border-r border-white/10 bg-zinc-950">
                      {hours.map((hour) => (
                        <div
                          key={hour}
                          className="border-b border-dashed border-white/10 px-3 pt-2 text-xs font-medium text-zinc-500"
                          style={{ height: HOUR_HEIGHT }}
                        >
                          {formatHour(hour)}
                        </div>
                      ))}
                    </div>

                    {groupedEvents.map(({ barber, events }) => (
                      <div
                        key={barber.id}
                        className="relative border-r border-white/10 bg-[radial-gradient(circle_at_top,hsl(43_96%_56%_/_0.04),transparent_24%),linear-gradient(180deg,#111216_0%,#0b0c0f_100%)]"
                        style={{ height: hours.length * HOUR_HEIGHT }}
                      >
                        {hours.map((hour) => (
                          <div
                            key={`${barber.id}-${hour}`}
                            className="pointer-events-none border-b border-dashed border-white/10"
                            style={{ height: HOUR_HEIGHT }}
                          />
                        ))}

                        {halfHourSlots.map((slot, index) => {
                          const slotDate = new Date(currentDate);
                          slotDate.setHours(slot.getHours(), slot.getMinutes(), 0, 0);

                          const limits = getScheduleLimits(slotDate);
                          const slotStartMinutes =
                            Number(formatBookingInAppTimeZone(slotDate, "H", APP_TIME_ZONE)) * 60 +
                            Number(formatBookingInAppTimeZone(slotDate, "m", APP_TIME_ZONE));
                          const isSlotAvailable =
                            !limits.isSunday &&
                            slotStartMinutes >= limits.startHour * 60 &&
                            slotStartMinutes <= limits.lastStartHour * 60;

                          return (
                            <button
                              key={`${barber.id}-slot-${index}`}
                              type="button"
                              disabled={!isSlotAvailable}
                              onClick={() => openCreateModal(barber.id, slotDate, true)}
                              className="absolute left-0 right-0 z-0 block border-transparent text-left transition hover:bg-white/[0.03] disabled:pointer-events-none disabled:bg-black/20 disabled:opacity-40"
                              style={{
                                top: getTopFromDate(slotDate),
                                height: HOUR_HEIGHT / 2,
                              }}
                              aria-label={`Criar agendamento às ${formatTime(slotDate)} para ${barber.name}`}
                            />
                          );
                        })}

                        {events.map((event) => {
                          const clamped = clampEventToVisibleHours(
                            event.start,
                            event.end,
                            currentDate
                          );

                          if (clamped.end <= clamped.start) {
                            return null;
                          }

                          const top = getTopFromDate(clamped.start);
                          const height = getHeightFromRange(clamped.start, clamped.end);

                          const horizontalGap = 8;
                          const totalGap = horizontalGap * (event.lanes - 1);
                          const widthPercent = (100 - totalGap) / event.lanes;
                          const left = `calc(${event.lane * widthPercent}% + ${event.lane * horizontalGap}px + 8px)`;
                          const width = `calc(${widthPercent}% - 16px)`;

                          if (event.type === "booking") {
                            const booking = event.data;
                            const styles = getBookingStatusClasses(booking.status);

                            return (
                              <button
                                key={booking.id}
                                onClick={() => setSelectedBooking(booking)}
                                className={`absolute z-10 overflow-hidden rounded-2xl border p-3 text-left shadow-[0_14px_35px_rgba(0,0,0,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(0,0,0,0.35)] ${styles.card}`}
                                style={{
                                  top,
                                  height,
                                  left,
                                  width,
                                }}
                              >
                                <div className="flex h-full flex-col justify-between gap-2">
                                  <div className="space-y-1">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="min-w-0">
                                        <p className="text-[11px] font-medium opacity-80">
                                          {formatTime(event.start)} - {formatTime(event.end)}
                                        </p>
                                        <p className="truncate text-sm font-bold">
                                          {booking.clientName || booking.user?.name || "Cliente"}
                                        </p>
                                      </div>

                                      <span
                                        className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${styles.badge}`}
                                      >
                                        {getBookingStatusLabel(booking.status)}
                                      </span>
                                    </div>

                                    <p className="truncate text-xs opacity-90">
                                      {booking.service.name}
                                    </p>
                                  </div>

                                  {height >= 86 && booking.clientPhone ? (
                                    <p className="truncate text-[11px] opacity-75">
                                      {booking.clientPhone}
                                    </p>
                                  ) : null}
                                </div>
                              </button>
                            );
                          }

                          const block = event.data;
                          const styles = getBlockClasses();

                          return (
                            <div
                              key={block.id}
                              className={`absolute z-10 overflow-hidden rounded-2xl border p-3 text-left shadow-[0_14px_35px_rgba(0,0,0,0.28)] ${styles.card}`}
                              style={{
                                top,
                                height,
                                left,
                                width,
                              }}
                            >
                              <div className="flex h-full flex-col justify-between gap-2">
                                <div>
                                  <div className="flex items-start justify-between gap-2">
                                    <p className="text-[11px] font-semibold uppercase tracking-wide">
                                      Bloqueio
                                    </p>

                                    <span
                                      className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${styles.badge}`}
                                    >
                                      Indisponível
                                    </span>
                                  </div>

                                  <p className="mt-1 text-sm font-bold">
                                    {block.reason || "Horário indisponível"}
                                  </p>
                                </div>

                                <p className="text-[11px] opacity-80">
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

              <BookingDrawer
                booking={selectedBooking}
                onClose={() => setSelectedBooking(null)}
                services={services}
                bookings={bookings}
                barbershopId={barbershopId}
                currentBarberId={currentBarberId}
              />
            </div>
          </div>
        </div>
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 p-4 backdrop-blur-sm">
          <div className="mx-auto my-6 flex max-h-[calc(100vh-3rem)] w-full max-w-lg flex-col overflow-hidden rounded-[28px] border border-white/10 bg-zinc-950 shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
            <div className="shrink-0 border-b border-white/10 p-6 pb-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Novo agendamento</h2>
                  <p className="mt-1 text-sm text-zinc-400">
                    Segunda a sexta até 20:00. Sábado até 21:00, com término máximo às 22:00.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-zinc-400 transition hover:bg-white/10 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateBooking} className="flex-1 space-y-4 overflow-y-auto p-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-200">
                  Barbeiro
                </label>
                <select
                  value={selectedBarberId}
                  onChange={(e) => setSelectedBarberId(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[hsl(43_96%_56%_/_0.45)]"
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
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-zinc-500 outline-none transition focus:border-[hsl(43_96%_56%_/_0.45)]"
                  required
                />
              </div>

              <div className="mt-2 flex items-center gap-2">
                <input
                  id="clienteRapido"
                  type="checkbox"
                  checked={isQuickClient}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setIsQuickClient(checked);

                    if (checked) {
                      setClientName("Cliente balcão");
                      setClientPhone("");
                    } else {
                      setClientName("");
                    }
                  }}
                />

                <label
                  htmlFor="clienteRapido"
                  className="cursor-pointer text-sm text-zinc-400"
                >
                  Cliente rápido (balcão)
                </label>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-200">
                  WhatsApp
                </label>
                <input
                  value={clientPhone}
                  onChange={(e) => setClientPhone(formatPhone(e.target.value))}
                  placeholder="(11) 99999-9999"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-zinc-500 outline-none transition focus:border-[hsl(43_96%_56%_/_0.45)]"
                  inputMode="numeric"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-200">
                  Serviço
                </label>

                <Select
                  value={serviceId}
                  onValueChange={(value) => {
                    setServiceId(value);
                    setSelectedHour("");
                    setSelectedDateTime("");
                  }}
                  required
                >
                  <SelectTrigger className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[hsl(43_96%_56%_/_0.45)]">
                    <SelectValue placeholder="Selecione um serviço" />
                  </SelectTrigger>

                  <SelectContent className="border-white/10 bg-zinc-950 text-white">
                    {services.map((service) => (
                      <SelectItem
                        key={service.id}
                        value={service.id}
                        className="text-white focus:bg-white/10 focus:text-white"
                      >
                        {service.name} — R$ {Number(service.price).toFixed(2)}
                        {service.durationInMinutes
                          ? ` • ${service.durationInMinutes} min`
                          : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-200">
                    Data
                  </label>

                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedHour("");
                      setSelectedDateTime("");
                    }}
                    className="w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none transition [color-scheme:dark] focus:border-[hsl(43_96%_56%_/_0.45)]"
                    required
                  />
                </div>

                <div className="space-y-3 border-t border-white/10 pt-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium text-white">
                      Horários disponíveis
                    </p>

                    <p className="text-xs text-zinc-400">
                      Duração do serviço: {selectedServiceDuration} min
                    </p>
                  </div>

                  {!serviceId ? (
                    <p className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-500">
                      Selecione um serviço para calcular os horários disponíveis.
                    </p>
                  ) : !selectedDate ? (
                    <p className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-500">
                      Selecione uma data para visualizar os horários.
                    </p>
                  ) : availableHours.length > 0 ? (
                    <div className="max-h-56 overflow-y-auto pr-1">
                      <div className="flex flex-wrap gap-2">
                        {availableHours.map((time) => (
                          <button
                            key={time}
                            type="button"
                            onClick={() => {
                              setSelectedHour(time);
                              setSelectedDateTime(`${selectedDate}T${time}`);
                            }}
                            className={`rounded-full border px-4 py-2 text-sm font-bold transition ${selectedHour === time
                                ? "border-transparent bg-[hsl(43_96%_56%)] text-black shadow-[0_0_20px_hsl(43_96%_56%_/_0.25)]"
                                : "border-white/10 bg-zinc-950 text-white hover:border-[hsl(43_96%_56%_/_0.45)] hover:bg-[hsl(43_96%_56%_/_0.08)]"
                              }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-500">
                      Nenhum horário disponível para este barbeiro nesta data.
                    </p>
                  )}
                </div>

                {previewDate && previewEndDate ? (
                  <div className="rounded-2xl border border-[hsl(43_96%_56%_/_0.25)] bg-[hsl(43_96%_56%_/_0.08)] p-4">
                    <p className="text-xs uppercase tracking-wide text-zinc-400">
                      Previsão do atendimento
                    </p>

                    <p className="mt-1 font-semibold text-white">
                      {formatBookingInAppTimeZone(
                        previewDate,
                        "dd/MM/yyyy 'às' HH:mm",
                        APP_TIME_ZONE
                      )}{" "}
                      até{" "}
                      {formatBookingInAppTimeZone(
                        previewEndDate,
                        "HH:mm",
                        APP_TIME_ZONE
                      )}
                    </p>
                  </div>
                ) : null}
              </div>

              <div className="mx-6 flex justify-end gap-3 border-t border-white/10 bg-zinc-950/95 px-6 py-4 backdrop-blur">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-zinc-200 transition hover:bg-white/10"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSavingCreate}
                  className="premium-button rounded-2xl px-4 py-3 text-sm font-semibold disabled:opacity-50"
                >
                  {isSavingCreate ? "Salvando..." : "Criar agendamento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isBlockModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 p-4 backdrop-blur-sm">
          <div className="mx-auto my-6 w-full max-w-lg rounded-[28px] border border-white/10 bg-zinc-950 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">Bloqueio de agenda</h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Bloqueie um período para impedir novos agendamentos.
                </p>
              </div>

              <button
                type="button"
                onClick={closeBlockModal}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-zinc-400 transition hover:bg-white/10 hover:text-white"
              >
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
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[hsl(43_96%_56%_/_0.45)]"
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
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[hsl(43_96%_56%_/_0.45)]"
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
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[hsl(43_96%_56%_/_0.45)]"
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
                  className="min-h-[110px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-zinc-500 outline-none transition focus:border-[hsl(43_96%_56%_/_0.45)]"
                />
              </div>

              <div className="mx-6 mt-6 border-t border-white/10 bg-zinc-950/95 px-6 py-4 backdrop-blur">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={closeBlockModal}
                    className="order-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-zinc-200 transition hover:bg-white/10 sm:order-1"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={isSavingBlock}
                    className="premium-button order-1 rounded-2xl px-4 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50 sm:order-2"
                  >
                    {isSavingBlock ? "Salvando..." : "Salvar bloqueio"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
