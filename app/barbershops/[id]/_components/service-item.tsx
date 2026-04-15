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

import { Barbershop, Booking, Service, Barber } from "@prisma/client";
import { ptBR } from "date-fns/locale";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { generateDayTimeList } from "../_helpers/hours";
import { addDays } from "date-fns";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface BarbershopWithBarbers extends Barbershop {
  barbers: Barber[];
}

interface ServiceItemProps {
  barbershop: BarbershopWithBarbers;
  service: Service;
}

type SuccessModalState = {
  open: boolean;
  bookingDate: Date;
  barberName: string;
} | null;

function getAppDayKey(date: Date | string) {
  return formatBookingInAppTimeZone(date, "yyyy-MM-dd", APP_TIME_ZONE);
}

function getAppTimeKey(date: Date | string) {
  return formatBookingInAppTimeZone(date, "HH:mm", APP_TIME_ZONE);
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 7) {
    return digits.replace(/^(\d{2})(\d+)/, "($1) $2");
  }

  return digits.replace(/^(\d{2})(\d{5})(\d+)/, "($1) $2-$3");
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
  const [dayBookings, setDayBookings] = useState<Booking[]>([]);
  const [successModal, setSuccessModal] = useState<SuccessModalState>(null);

  useEffect(() => {
    if (!date) {
      setDayBookings([]);
      return;
    }

    const fetchDayBookings = async () => {
      try {
        const dayKey = getAppDayKey(date);

        const response = await fetch(
          `/api/v1/bookings/day?barbershopId=${barbershop.id}&date=${encodeURIComponent(
            dayKey
          )}&timeZone=${encodeURIComponent(APP_TIME_ZONE)}`
        );

        if (!response.ok) {
          throw new Error("Erro ao buscar agendamentos do dia.");
        }

        const result = await response.json();
        const bookings = Array.isArray(result) ? result : result?.data ?? [];

        setDayBookings(bookings);
      } catch (error) {
        console.error(error);
        setDayBookings([]);
      }
    };

    fetchDayBookings();
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

      setSuccessModal({
        open: true,
        bookingDate: bookingDateUtc,
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

    const selectedDayKey = getAppDayKey(date);

    return generateDayTimeList(date).filter((time) => {
      return !dayBookings.some((booking) => {
        const bookingDayKey = getAppDayKey(booking.date);
        const bookingTimeKey = getAppTimeKey(booking.date);

        return (
          booking.barberId === barberId &&
          booking.status !== "CANCELED" &&
          bookingDayKey === selectedDayKey &&
          bookingTimeKey === time
        );
      });
    });
  }, [date, barberId, dayBookings]);

  const previewDate = useMemo(() => {
    if (!date || !hour) return undefined;

    return buildUtcDateFromLocalSelection(date, hour, APP_TIME_ZONE);
  }, [date, hour]);

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
              <p className="text-sm text-gray-400">{service.description}</p>

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
              <p className="text-sm text-zinc-400">Selecione o dia e o horário.</p>

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
              <div className="flex gap-3 overflow-x-auto border-t border-secondary px-5 py-6">
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
                <p className="font-semibold text-white">{service.name}</p>
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