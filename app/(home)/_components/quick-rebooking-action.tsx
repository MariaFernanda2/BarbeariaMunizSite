"use client";

import { format, setHours, setMinutes, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/app/_components/ui/button";
import { Calendar } from "@/app/_components/ui/calendar";

import { generateDayTimeList } from "../../barbershops/[id]/_helpers/hours";

import {
  Barber,
  Service,
  Barbershop,
} from "@/app/types/booking";

export interface LastBooking {
  id: string;
  date: string;
  barber: Barber;
  service: Service;
  barbershop: Barbershop;
}

interface QuickRebookingActionProps {
  lastBooking: LastBooking;
  setSheetIsOpen: (isOpen: boolean) => void;
}

interface DayBooking {
  id: string;
  date: string;
  barberId: string;
}

const QuickRebookingAction = ({
  lastBooking,
  setSheetIsOpen,
}: QuickRebookingActionProps) => {
  const router = useRouter();
  const { data: session } = useSession();

  const [date, setDate] = useState<Date | undefined>(undefined);
  const [hour, setHour] = useState<string>("");
  const [submitIsLoading, setSubmitIsLoading] = useState(false);
  const [dayBookings, setDayBookings] = useState<DayBooking[]>([]);

  const { barber, service, barbershop } = lastBooking;

  // 🔹 Buscar bookings do dia via REST
  useEffect(() => {
    if (!date) return;

    const fetchDayBookings = async () => {
      try {
        const response = await fetch(
          `/api/v1/bookings/day?barbershopId=${barbershop.id}&date=${date.toISOString()}`
        );

        const result = await response.json();

        const barberBookings = result.data.filter(
          (booking: DayBooking) => booking.barberId === barber.id
        );

        setDayBookings(barberBookings);
      } catch (error) {
        console.error(error);
      }
    };

    fetchDayBookings();
  }, [date, barbershop.id, barber.id]);

  // 🔹 Calcular horários disponíveis
  const timeList = useMemo(() => {
    if (!date) return [];

    return generateDayTimeList(date).filter((time) => {
      const [timeHour, timeMinutes] = time.split(":").map(Number);

      const bookingExists = dayBookings.some((booking) => {
        const bookingDate = new Date(booking.date);
        const bookingHour = bookingDate.getHours();
        const bookingMinutes = bookingDate.getMinutes();

        return (
          bookingHour === timeHour &&
          bookingMinutes === timeMinutes
        );
      });

      return !bookingExists;
    });
  }, [date, dayBookings]);

  // 🔹 Criar novo booking via REST
  const handleBookingSubmit = async () => {
    if (!hour || !date || !session?.user) {
      toast.error("Selecione data e horário.");
      return;
    }

    setSubmitIsLoading(true);

    try {
      const [dateHour, dateMinutes] = hour.split(":").map(Number);
      const newDate = setMinutes(
        setHours(date, dateHour),
        dateMinutes
      );

      const response = await fetch("/api/v1/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceId: service.id,
          barbershopId: barbershop.id,
          barberId: barber.id,
          date: newDate.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao criar agendamento");
      }

      setSheetIsOpen(false);
      setDate(undefined);
      setHour("");

      toast("Reagendamento realizado!", {
        description: format(
          newDate,
          `'Corte com ${barber.name} para' dd 'de' MMMM 'às' HH':'mm`,
          { locale: ptBR }
        ),
        action: {
          label: "Ver Agendamentos",
          onClick: () => router.push("/bookings"),
        },
      });
    } catch (error) {
      console.error(error);
      toast.error("Erro ao realizar reagendamento.");
    } finally {
      setSubmitIsLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto flex flex-col h-full">
      {/* HEADER */}
      <div className="p-5 border-b border-secondary">
        <h3 className="font-bold text-lg mb-2">
          Reagendamento Rápido
        </h3>

        <div className="mt-3 p-4 border border-primary rounded-lg bg-primary/10">
          <p className="font-bold">{service.name}</p>
          <p className="text-sm">Com: {barber.name}</p>
          <p className="text-xs text-gray-500">
            {barbershop.name}
          </p>
        </div>
      </div>

      {/* CALENDÁRIO */}
      <div className="py-6 border-b border-secondary flex justify-center">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          locale={ptBR}
          fromDate={addDays(new Date(), 1)}
        />
      </div>

      {/* HORÁRIOS */}
      {date && (
        <div className="flex gap-3 overflow-x-auto py-6 px-5 border-b border-secondary">
          {timeList.map((time) => (
            <Button
              key={time}
              onClick={() => setHour(time)}
              variant={hour === time ? "default" : "outline"}
              className="rounded-full shrink-0"
            >
              {time}
            </Button>
          ))}

          {timeList.length === 0 && (
            <p className="text-gray-400 text-sm">
              Nenhum horário disponível com {barber.name}
            </p>
          )}
        </div>
      )}

      {/* BOTÃO */}
      <div className="p-5 border-t border-secondary mt-auto">
        <Button
          onClick={handleBookingSubmit}
          disabled={!hour || !date || submitIsLoading}
          className="w-full"
        >
          {submitIsLoading && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Confirmar Reagendamento
        </Button>
      </div>
    </div>
  );
};

export default QuickRebookingAction;
