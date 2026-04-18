"use client";

import { Button } from "@/app/_components/ui/button";
import { Calendar } from "@/app/_components/ui/calendar";
import { Card, CardContent } from "@/app/_components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/app/_components/ui/sheet";
import BookingInfo from "@/app/_components/booking-info";
import {
  APP_TIME_ZONE,
  buildUtcDateFromLocalSelection,
  formatBookingInAppTimeZone,
} from "@/app/lib/utils/timezone";

import { Barbershop, Service, Barber } from "@prisma/client";
import { ptBR } from "date-fns/locale";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { addDays } from "date-fns";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface BarbershopWithBarbers extends Barbershop {
  barbers: Barber[];
}

interface ServiceItemProps {
  barbershop: BarbershopWithBarbers;
  service: Service & {
    durationInMinutes?: number;
  };
}

type DayBooking = {
  id: string;
  date: string | Date;
  endDate: string | Date;
  status: "CONFIRMED" | "COMPLETED" | "CANCELED";
  barberId: string;
};

type DayBlock = {
  id: string;
  barberId: string;
  startDate: string | Date;
  endDate: string | Date;
  reason?: string | null;
};

type SuccessModalState = {
  open: boolean;
  bookingDate: Date;
  bookingEndDate: Date;
  barberName: string;
} | null;

const START_HOUR = 8;
const END_HOUR = 22;
const SLOT_INTERVAL_MINUTES = 10;

function getAppDayKey(date: Date | string) {
  return formatBookingInAppTimeZone(date, "yyyy-MM-dd", APP_TIME_ZONE);
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 2) return digits;
  if (digits.length <= 7) {
    return digits.replace(/^(\d{2})(\d+)/, "($1) $2");
  }

  return digits.replace(/^(\d{2})(\d{5})(\d+)/, "($1) $2-$3");
}

function hasTimeOverlap(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date
) {
  return startA < endB && endA > startB;
}

function generateDayTimeList(date: Date) {
  const list: string[] = [];
  const current = new Date(date);

  current.setHours(START_HOUR, 0, 0, 0);

  const end = new Date(date);
  end.setHours(END_HOUR, 0, 0, 0);

  while (current <= end) {
    list.push(formatBookingInAppTimeZone(current, "HH:mm", APP_TIME_ZONE));
    current.setMinutes(current.getMinutes() + SLOT_INTERVAL_MINUTES);
  }

  return list;
}

const ServiceItem = ({ service, barbershop }: ServiceItemProps) => {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [date, setDate] = useState<Date>();
  const [hour, setHour] = useState<string>();
  const [barberId, setBarberId] = useState<string>("");

  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");

  const [submitIsLoading, setSubmitIsLoading] = useState(false);
  const [sheetIsOpen, setSheetIsOpen] = useState(false);

  const [dayBookings, setDayBookings] = useState<DayBooking[]>([]);
  const [dayBlocks, setDayBlocks] = useState<DayBlock[]>([]);

  const [successModal, setSuccessModal] = useState<SuccessModalState>(null);

  const durationInMinutes = service.durationInMinutes ?? 30;

  useEffect(() => {
    if (!date) {
      setDayBookings([]);
      setDayBlocks([]);
      return;
    }

    const fetchDayData = async () => {
      try {
        const dayKey = getAppDayKey(date);

        const [bookingsResponse, blocksResponse] = await Promise.all([
          fetch(
            `/api/v1/bookings/day?barbershopId=${barbershop.id}&date=${encodeURIComponent(
              dayKey
            )}&timeZone=${encodeURIComponent(APP_TIME_ZONE)}`
          ),
          fetch(
            `/api/v1/schedule-blocks/day?barbershopId=${barbershop.id}&date=${encodeURIComponent(
              dayKey
            )}&timeZone=${encodeURIComponent(APP_TIME_ZONE)}`
          ),
        ]);

        if (!bookingsResponse.ok) {
          throw new Error("Erro ao buscar agendamentos do dia.");
        }

        if (!blocksResponse.ok) {
          throw new Error("Erro ao buscar bloqueios do dia.");
        }

        const bookingsResult = await bookingsResponse.json();
        const blocksResult = await blocksResponse.json();

        const bookings = Array.isArray(bookingsResult)
          ? bookingsResult
          : bookingsResult?.data ?? [];

        const blocks = Array.isArray(blocksResult)
          ? blocksResult
          : blocksResult?.data ?? [];

        setDayBookings(bookings);
        setDayBlocks(blocks);
      } catch (error) {
        console.error(error);
        setDayBookings([]);
        setDayBlocks([]);
      }
    };

    fetchDayData();
  }, [date, barbershop.id]);

  const handleBookingClick = async () => {
    if (status === "loading") return;

    if (!session) {
      await signIn("google", {
        callbackUrl: window.location.href,
      });
      return;
    }

    setSheetIsOpen(true);
  };

  const handleBookingSubmit = async () => {
    if (
      !hour ||
      !date ||
      !barberId ||
      !clientName.trim() ||
      !clientPhone.trim()
    ) {
      toast.error("Preencha todos os dados.");
      return;
    }

    if (!session?.user?.id) {
      toast.error("Você precisa estar logado para reservar.");
      return;
    }

    setSubmitIsLoading(true);

    try {
      const bookingDateUtc = buildUtcDateFromLocalSelection(
        date,
        hour,
        APP_TIME_ZONE
      );

      const bookingEndDateUtc = new Date(
        bookingDateUtc.getTime() + durationInMinutes * 60 * 1000
      );

      const selectedBarber = barbershop.barbers.find(
        (barber) => barber.id === barberId
      );

      const response = await fetch("/api/v1/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.id,
          serviceId: service.id,
          barberId,
          barbershopId: barbershop.id,
          date: bookingDateUtc.toISOString(),
          clientName: clientName.trim(),
          clientPhone: clientPhone.trim(),
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.message || "Erro ao criar reserva");
      }

      setSheetIsOpen(false);
      setHour(undefined);
      setDate(undefined);
      setBarberId("");
      setClientName("");
      setClientPhone("");
      setDayBookings([]);
      setDayBlocks([]);

      setSuccessModal({
        open: true,
        bookingDate: bookingDateUtc,
        bookingEndDate: bookingEndDateUtc,
        barberName: selectedBarber?.name || "Barbeiro",
      });
    } catch (error: any) {
      console.error("HANDLE BOOKING ERROR:", error);
      toast.error(error?.message || "Erro ao realizar reserva");
    } finally {
      setSubmitIsLoading(false);
    }
  };

  const timeList = useMemo(() => {
    if (!date || !barberId) return [];

    const now = new Date();
    const selectedDayKey = getAppDayKey(date);

    return generateDayTimeList(date).filter((time) => {
      const slotStart = buildUtcDateFromLocalSelection(
        date,
        time,
        APP_TIME_ZONE
      );

      const slotEnd = new Date(
        slotStart.getTime() + durationInMinutes * 60 * 1000
      );

      const hasBookingConflict = dayBookings.some((booking) => {
        if (booking.barberId !== barberId) return false;
        if (booking.status === "CANCELED") return false;
        if (getAppDayKey(booking.date) !== selectedDayKey) return false;

        const bookingStart = new Date(booking.date);
        const bookingEnd = new Date(booking.endDate);

        return hasTimeOverlap(slotStart, slotEnd, bookingStart, bookingEnd);
      });

      if (hasBookingConflict) return false;

      const hasBlockConflict = dayBlocks.some((block) => {
        if (block.barberId !== barberId) return false;

        const blockStart = new Date(block.startDate);
        const blockEnd = new Date(block.endDate);

        return hasTimeOverlap(slotStart, slotEnd, blockStart, blockEnd);
      });

      if (hasBlockConflict) return false;

      const slotEndHour = Number(
        formatBookingInAppTimeZone(slotEnd, "H", APP_TIME_ZONE)
      );
      const slotEndMinute = Number(
        formatBookingInAppTimeZone(slotEnd, "m", APP_TIME_ZONE)
      );

      if (slotEndHour > END_HOUR) return false;
      if (slotEndHour === END_HOUR && slotEndMinute > 0) return false;

      if (slotStart <= now) return false;

      return true;
    });
  }, [date, barberId, dayBookings, dayBlocks, durationInMinutes]);

  const previewDate = useMemo(() => {
    if (!date || !hour) return undefined;

    return buildUtcDateFromLocalSelection(date, hour, APP_TIME_ZONE);
  }, [date, hour]);

  const previewEndDate = useMemo(() => {
    if (!previewDate) return undefined;

    return new Date(previewDate.getTime() + durationInMinutes * 60 * 1000);
  }, [previewDate, durationInMinutes]);

  return (
    <>
      <Card className="premium-card overflow-hidden rounded-3xl">
        <CardContent className="w-full p-3">
          <div className="flex w-full items-center gap-4">
            <div className="relative max-h-[110px] max-w-[110px] min-h-[110px] min-w-[110px] overflow-hidden rounded-2xl border border-premium bg-premium-soft">
              <Image
                className="rounded-lg"
                src={service.imageUrl || "/placeholder.png"}
                fill
                style={{ objectFit: "contain" }}
                alt={service.name}
              />
            </div>

            <div className="flex w-full flex-col">
              <h2 className="font-bold">{service.name}</h2>
              <p className="text-sm text-gray-400">
                {service.description}
                {durationInMinutes ? ` • ${durationInMinutes} min` : ""}
              </p>

              <div className="mt-3 flex items-center justify-between">
                <p className="text-premium text-sm font-bold">
                  {Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(Number(service.price))}
                </p>

                <Button onClick={handleBookingClick} className="premium-button">
                  Reservar
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Sheet open={sheetIsOpen} onOpenChange={setSheetIsOpen}>
        <SheetContent className="premium-card flex h-full flex-col p-0">
          <SheetHeader className="border-b border-secondary px-5 py-6 text-left">
            <SheetTitle className="text-premium">Fazer Reserva</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            <div className="border-b border-secondary px-5 py-6">
              <h3 className="mb-4 text-sm font-semibold">Escolha seu barbeiro</h3>

              <div className="grid grid-cols-3 gap-4">
                {barbershop.barbers?.map((barber) => (
                  <button
                    key={barber.id}
                    type="button"
                    onClick={() => {
                      setBarberId(barber.id);
                      setHour(undefined);
                    }}
                    className={`flex flex-col items-center rounded-xl border p-3 transition-all ${
                      barberId === barber.id
                        ? "border-primary bg-premium-soft premium-glow"
                        : "border-gray-200 hover:border-primary"
                    }`}
                  >
                    <div className="relative h-16 w-16 overflow-hidden rounded-full">
                      <Image
                        src={barber.imageUrl || "/placeholder.png"}
                        alt={barber.name}
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>

                    <span className="mt-2 text-center text-xs font-medium">
                      {barber.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 border-b border-secondary px-5 py-6">
              <p className="text-sm text-zinc-400">
                Precisamos de alguns dados seus para caso seja necessário
                entrarmos em contato com você.
              </p>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-200">
                  Seu nome
                </label>
                <input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Digite seu nome"
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder:text-zinc-500 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-200">
                  WhatsApp
                </label>
                <input
                  value={clientPhone}
                  onChange={(e) => setClientPhone(formatPhone(e.target.value))}
                  placeholder="(11) 99999-9999"
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder:text-zinc-500 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                  inputMode="numeric"
                  required
                />
              </div>
            </div>

            <div className="space-y-4 border-b border-secondary px-5 py-6">
              <p className="text-sm text-zinc-400">
                Selecione o dia e o horário.
              </p>

              <div className="rounded-3xl border border-premium bg-premium-soft/40 p-2">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(selectedDate) => {
                    setDate(selectedDate);
                    setHour(undefined);
                  }}
                  locale={ptBR}
                  fromDate={addDays(new Date(), 1)}
                />
              </div>
            </div>

            {date && barberId && (
              <div className="space-y-3 border-t border-secondary px-5 py-6">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-white">
                    Horários disponíveis
                  </p>
                  <p className="text-xs text-zinc-400">
                    Serviço com duração de {durationInMinutes} min
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  {timeList.length > 0 ? (
                    timeList.map((time) => (
                      <Button
                        key={time}
                        onClick={() => setHour(time)}
                        variant="outline"
                        className={`rounded-full ${
                          hour === time
                            ? "premium-button border-transparent"
                            : "border-zinc-700 bg-transparent text-white hover:border-primary hover:bg-premium-soft"
                        }`}
                      >
                        {time}
                      </Button>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Nenhum horário disponível para este barbeiro nesta data.
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="border-t border-secondary px-5 py-6">
              <BookingInfo
                booking={{
                  barbershop,
                  service: {
                    ...service,
                    price: Number(service.price),
                  },
                  date: previewDate,
                }}
              />

              {previewDate && previewEndDate ? (
                <div className="mt-4 rounded-2xl border border-premium bg-premium-soft/30 p-4">
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
          </div>

          <SheetFooter className="border-t border-secondary px-5 py-4">
            <Button
              onClick={handleBookingSubmit}
              className="premium-button w-full"
              disabled={
                !hour ||
                !date ||
                !barberId ||
                !clientName.trim() ||
                !clientPhone.trim() ||
                submitIsLoading
              }
            >
              {submitIsLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Confirmar reserva
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {successModal?.open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
          <div className="premium-card premium-glow w-full max-w-md rounded-3xl border border-premium bg-zinc-950 p-6 text-center shadow-2xl">
            <div className="mb-4 text-5xl">✅</div>

            <h2 className="text-xl font-bold text-white">
              Reserva confirmada!
            </h2>

            <p className="mt-2 text-sm text-zinc-400">
              Seu horário foi agendado com sucesso.
            </p>

            <div className="mt-6 space-y-3 rounded-2xl border border-premium bg-premium-soft/40 p-4 text-left">
              <div>
                <p className="text-xs uppercase tracking-wide text-zinc-400">
                  Serviço
                </p>
                <p className="font-semibold text-white">
                  {service.name} • {durationInMinutes} min
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-zinc-400">
                  Barbeiro
                </p>
                <p className="font-semibold text-white">
                  {successModal.barberName}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-zinc-400">
                  Data e horário
                </p>
                <p className="font-semibold text-white">
                  {formatBookingInAppTimeZone(
                    successModal.bookingDate,
                    "dd/MM/yyyy 'às' HH:mm",
                    APP_TIME_ZONE
                  )}{" "}
                  até{" "}
                  {formatBookingInAppTimeZone(
                    successModal.bookingEndDate,
                    "HH:mm",
                    APP_TIME_ZONE
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-zinc-400">
                  Unidade
                </p>
                <p className="font-semibold text-white">{barbershop.name}</p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                className="premium-button w-full"
                onClick={() => router.push("/bookings")}
              >
                Ver agendamentos
              </Button>

              <Button
                variant="outline"
                className="w-full border-zinc-700 text-white hover:bg-zinc-900"
                onClick={() => setSuccessModal(null)}
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ServiceItem;