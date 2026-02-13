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

import { Barbershop, Booking, Service, Barber } from "@prisma/client";
import { ptBR } from "date-fns/locale";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { generateDayTimeList } from "../_helpers/hours";
import { addDays, format, setHours, setMinutes } from "date-fns";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import BookingInfo from "@/app/_components/booking-info";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";

interface BarbershopWithBarbers extends Barbershop {
  barbers: Barber[];
}

interface ServiceItemProps {
  barbershop: BarbershopWithBarbers;
  service: Service;
}

const ServiceItem = ({ service, barbershop }: ServiceItemProps) => {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [date, setDate] = useState<Date>();
  const [hour, setHour] = useState<string>();
  const [barberId, setBarberId] = useState<string>();

  const [submitIsLoading, setSubmitIsLoading] = useState(false);
  const [sheetIsOpen, setSheetIsOpen] = useState(false);
  const [dayBookings, setDayBookings] = useState<Booking[]>([]);

  // Buscar agendamentos do dia
  useEffect(() => {
    if (!date) return;

    const fetchDayBookings = async () => {
      try {
        const response = await fetch(
          `/api/v1/bookings/day?barbershopId=${barbershop.id}&date=${date.toISOString()}`
        );

        const data = await response.json();
        setDayBookings(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchDayBookings();
  }, [date, barbershop.id]);

  // 🔥 Controle correto de autenticação
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
  if (!hour || !date || !barberId) {
    console.log("Dados incompletos", { hour, date, barberId });
    return;
  }

  if (!session?.user?.id) {
    console.log("Usuário sem ID na sessão", session);
    toast.error("Você precisa estar logado para reservar");
    return;
  }

  setSubmitIsLoading(true);

  try {
    const dateHour = Number(hour.split(":")[0]);
    const dateMinutes = Number(hour.split(":")[1]);
    const bookingDate = setMinutes(setHours(date, dateHour), dateMinutes);

    console.log("ENVIANDO BOOKING...", {
      userId: session.user.id,
      serviceId: service.id,
      barberId,
      date: bookingDate.toISOString(),
    });

    const response = await fetch("/api/v1/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: session.user.id,
        serviceId: service.id,
        barberId,
        barbershopId: barbershop.id,
        date: bookingDate.toISOString(),
      }),
    });

    const result = await response.json();
    console.log("RESPOSTA BOOKING:", result);

    if (!response.ok) {
      throw new Error(result.message || "Erro ao criar reserva");
    }

    setSheetIsOpen(false);
    setHour(undefined);
    setDate(undefined);
    setBarberId(undefined);

    toast("Reserva realizada com sucesso!", {
      description: format(
        bookingDate,
        "'Para' dd 'de' MMMM 'às' HH':'mm'.'",
        { locale: ptBR }
      ),
      action: { label: "Visualizar", onClick: () => router.push("/bookings") },
    });
  } catch (error: any) {
    console.error("HANDLE BOOKING ERROR:", error);
    toast.error(error.message || "Erro ao realizar reserva");
  } finally {
    setSubmitIsLoading(false);
  }
};

  const timeList = useMemo(() => {
    if (!date) return [];

    return generateDayTimeList(date).filter((time) => {
      const [hourStr, minuteStr] = time.split(":");

      return !dayBookings.find((booking) => {
        const bookingHour = new Date(booking.date).getHours();
        const bookingMinute = new Date(booking.date).getMinutes();

        return (
          bookingHour === Number(hourStr) &&
          bookingMinute === Number(minuteStr)
        );
      });
    });
  }, [date, dayBookings]);

  return (
    <Card>
      <CardContent className="p-3 w-full">
        <div className="flex gap-4 items-center w-full">
          <div className="relative min-h-[110px] min-w-[110px] max-h-[110px] max-w-[110px]">
            <Image
              className="rounded-lg"
              src={service.imageUrl}
              fill
              style={{ objectFit: "contain" }}
              alt={service.name}
            />
          </div>

          <div className="flex flex-col w-full">
            <h2 className="font-bold">{service.name}</h2>
            <p className="text-sm text-gray-400">{service.description}</p>

            <div className="flex items-center justify-between mt-3">
              <p className="text-primary text-sm font-bold">
                {Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(Number(service.price))}
              </p>

              <Button variant="secondary" onClick={handleBookingClick}>
                Reservar
              </Button>
            </div>
          </div>
        </div>
      </CardContent>

      <Sheet open={sheetIsOpen} onOpenChange={setSheetIsOpen}>
        <SheetContent className="p-0 flex flex-col h-full">
          <SheetHeader className="text-left px-5 py-6 border-b border-secondary">
            <SheetTitle>Fazer Reserva</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            <div className="py-6 px-5 border-b border-secondary">
              <Select value={barberId} onValueChange={setBarberId}>
                <SelectTrigger className="w-full mt-2">
                  <SelectValue placeholder="Escolha um barbeiro" />
                </SelectTrigger>
                <SelectContent>
                  {barbershop.barbers?.map((barber) => (
                    <SelectItem key={barber.id} value={barber.id}>
                      {barber.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="py-6">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                locale={ptBR}
                fromDate={addDays(new Date(), 1)}
              />
            </div>

            {date && (
              <div className="flex gap-3 overflow-x-auto py-6 px-5 border-t border-secondary">
                {timeList.map((time) => (
                  <Button
                    key={time}
                    onClick={() => setHour(time)}
                    variant={hour === time ? "default" : "outline"}
                    className="rounded-full"
                  >
                    {time}
                  </Button>
                ))}
              </div>
            )}

            <div className="py-6 px-5 border-t border-secondary">
              <BookingInfo
                booking={{
                  barbershop,
                  service,
                  date:
                    date && hour
                      ? setMinutes(
                          setHours(date, Number(hour.split(":")[0])),
                          Number(hour.split(":")[1])
                        )
                      : undefined,
                }}
              />
            </div>
          </div>

          <SheetFooter className="px-5 py-4 border-t border-secondary">
            <Button
              onClick={handleBookingSubmit}
              disabled={!hour || !date || !barberId || submitIsLoading}
            >
              {submitIsLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Confirmar reserva
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </Card>
  );
};

export default ServiceItem;
