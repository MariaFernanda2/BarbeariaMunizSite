"use client";

import { addDays, format, setHours, setMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/app/_components/ui/button";
import { Calendar } from "@/app/_components/ui/calendar";
import { generateDayTimeList } from "../../barbershops/[id]/_helpers/hours";

import type {
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

  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedHour, setSelectedHour] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dayBookings, setDayBookings] = useState<DayBooking[]>([]);

  const { barber, service, barbershop } = lastBooking;

  useEffect(() => {
    if (!selectedDate) {
      setDayBookings([]);
      return;
    }

    const fetchDayBookings = async () => {
      try {
        const response = await fetch(
          `/api/v1/bookings/day?barbershopId=${barbershop.id}&date=${selectedDate.toISOString()}`
        );

        if (!response.ok) {
          throw new Error("Erro ao buscar agendamentos do dia.");
        }

        const result = await response.json();

        const barberBookings = (result.data ?? []).filter(
          (booking: DayBooking) => booking.barberId === barber.id
        );

        setDayBookings(barberBookings);
      } catch (error) {
        console.error(error);
        toast.error("Não foi possível carregar os horários do dia.");
        setDayBookings([]);
      }
    };

    fetchDayBookings();
  }, [selectedDate, barbershop.id, barber.id]);

  const availableTimes = useMemo(() => {
    if (!selectedDate) return [];

    const generatedTimes = generateDayTimeList(selectedDate);

    return generatedTimes.filter((time) => {
      const [hour, minutes] = time.split(":").map(Number);

      const hasBookingAtTime = dayBookings.some((booking) => {
        const bookingDate = new Date(booking.date);

        return (
          bookingDate.getHours() === hour &&
          bookingDate.getMinutes() === minutes
        );
      });

      return !hasBookingAtTime;
    });
  }, [selectedDate, dayBookings]);

  const resetForm = () => {
    setSelectedDate(undefined);
    setSelectedHour("");
  };

  const buildBookingDate = () => {
    if (!selectedDate || !selectedHour) return null;

    const [hour, minutes] = selectedHour.split(":").map(Number);

    return setMinutes(setHours(selectedDate, hour), minutes);
  };

  const handleBookingSubmit = async () => {
    if (!selectedDate || !selectedHour || !session?.user) {
      toast.error("Selecione uma data e um horário.");
      return;
    }

    const bookingDate = buildBookingDate();

    if (!bookingDate) {
      toast.error("Não foi possível montar a data do agendamento.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/v1/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceId: service.id,
          barbershopId: barbershop.id,
          barberId: barber.id,
          date: bookingDate.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao criar agendamento.");
      }

      setSheetIsOpen(false);
      resetForm();

      toast("Reagendamento realizado!", {
        description: format(
          bookingDate,
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
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-full flex-1 flex-col overflow-y-auto">
      <div className="border-b border-secondary p-5">
        <h3 className="mb-2 text-lg font-bold">Reagendamento Rápido</h3>

        <div className="mt-3 rounded-lg border border-primary bg-primary/10 p-4">
          <p className="font-bold">{service.name}</p>
          <p className="text-sm">Com: {barber.name}</p>
          <p className="text-xs text-gray-500">{barbershop.name}</p>
        </div>
      </div>

      <div className="flex justify-center border-b border-secondary py-6">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          locale={ptBR}
          fromDate={addDays(new Date(), 1)}
        />
      </div>

      {selectedDate && (
        <div className="flex gap-3 overflow-x-auto border-b border-secondary px-5 py-6">
          {availableTimes.map((time) => (
            <Button
              key={time}
              type="button"
              onClick={() => setSelectedHour(time)}
              variant={selectedHour === time ? "default" : "outline"}
              className="shrink-0 rounded-full"
            >
              {time}
            </Button>
          ))}

          {availableTimes.length === 0 && (
            <p className="text-sm text-gray-400">
              Nenhum horário disponível com {barber.name}
            </p>
          )}
        </div>
      )}

      <div className="mt-auto border-t border-secondary p-5">
        <Button
          onClick={handleBookingSubmit}
          disabled={!selectedDate || !selectedHour || isSubmitting}
          className="w-full"
        >
          {isSubmitting && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Confirmar Reagendamento
        </Button>
      </div>
    </div>
  );
};

export default QuickRebookingAction;