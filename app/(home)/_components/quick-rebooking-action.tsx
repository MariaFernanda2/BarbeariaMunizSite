// app/page/_components/quick-rebooking-action.tsx
"use client";

import { Barbershop, Booking, Service, Barber } from "@prisma/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/app/_components/ui/button";
import { Calendar } from "@/app/_components/ui/calendar";
import { setHours, setMinutes, addDays } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { generateDayTimeList } from "../../barbershops/[id]/_helpers/hours";
import { getDayBookings } from "../../barbershops/[id]/_actions/get-day-bookings";
import { saveBooking } from "../../barbershops/[id]/_actions/save-booking";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

// Tipagem para o agendamento completo
type LastBooking = Booking & {
  barber: Barber;
  service: Service;
  barbershop: Barbershop;
};

interface QuickRebookingActionProps {
  lastBooking: LastBooking;
  setSheetIsOpen: (isOpen: boolean) => void;
}

const QuickRebookingAction = ({ lastBooking, setSheetIsOpen }: QuickRebookingActionProps) => {
  const router = useRouter();
  const { data } = useSession();
  
  // Estados de Agendamento
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [hour, setHour] = useState<string>(""); 
  const [submitIsLoading, setSubmitIsLoading] = useState(false);
  const [dayBookings, setDayBookings] = useState<Booking[]>([]);

  // Barbeiro e Serviço são fixos com base no último agendamento
  const { barber, service, barbershop } = lastBooking;

  // Lógica para buscar os agendamentos do dia (iguais ao ServiceItem)
  useEffect(() => {
    if (!date) return;
    const refreshAvailableHours = async () => {
      const _dayBookings = await getDayBookings(barbershop.id, date);
      // Filtramos APENAS os agendamentos deste BARBEIRO para checar a disponibilidade
      const barberBookings = _dayBookings.filter(booking => booking.barberId === barber.id);
      setDayBookings(barberBookings);
    };
    refreshAvailableHours();
  }, [date, barbershop.id, barber.id]);

  // Lista de horários disponíveis (iguais ao ServiceItem)
  const timeList = useMemo(() => {
    if (!date) return [];

    return generateDayTimeList(date).filter((time) => {
      const [timeHour, timeMinutes] = time.split(":").map(Number);

      const bookingExists = dayBookings.some((booking) => {
        const bookingHour = booking.date.getHours();
        const bookingMinutes = booking.date.getMinutes();
        return bookingHour === timeHour && bookingMinutes === timeMinutes;
      });

      return !bookingExists;
    });
  }, [date, dayBookings]);

  const handleBookingSubmit = async () => {
    setSubmitIsLoading(true);

    try {
      if (hour === "" || !date || !data?.user) {
        toast.error("Por favor, selecione uma data e horário.");
        setSubmitIsLoading(false);
        return;
      }

      const [dateHour, dateMinutes] = hour.split(":").map(Number);
      const newDate = setMinutes(setHours(date, dateHour), dateMinutes);

      await saveBooking({
        serviceId: service.id,
        barbershopId: barbershop.id,
        date: newDate,
        userId: (data.user as any).id,
        barberId: barber.id, // Barbeiro fixo!
      });

      setSheetIsOpen(false);
      setDate(undefined);
      setHour("");

      toast("Reagendamento Rápido Realizado!", {
        description: format(newDate, `'Corte com ${barber.name} para' dd 'de' MMMM 'às' HH':'mm'.'`, {
          locale: ptBR,
        }),
        action: {
          label: "Visualizar",
          onClick: () => router.push("/bookings"),
        },
      });
    } catch (error) {
      console.error(error);
      toast.error("Ocorreu um erro ao tentar realizar o reagendamento.");
    } finally {
      setSubmitIsLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto flex flex-col h-full">
      {/* 1. SEÇÃO DE CONFIRMAÇÃO (O POP-UP) */}
      <div className="p-5 border-b border-secondary">
        <h3 className="font-bold text-lg mb-2">Reagendamento Rápido</h3>
        <p className="text-sm text-gray-400">
          Deseja agendar novamente o seu último serviço:
        </p>
        
        {/* Cartão de Info */}
        <div className="mt-3 p-4 border border-primary rounded-lg bg-primary/10">
          <p className="font-bold">{service.name}</p>
          <p className="text-sm">Com: **{barber.name}**</p>
          <p className="text-xs text-gray-500">{barbershop.name}</p>
        </div>
      </div>
      
      {/* 2. CALENDÁRIO */}
      <div className="py-6 border-b border-secondary flex justify-center">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          locale={ptBR}
          fromDate={addDays(new Date(), 1)} // Permite agendar a partir de amanhã
          styles={{ 
            // ... Seus estilos do calendário ... 
            head_cell: { width: "100%", textTransform: "capitalize" },
            cell: { width: "100%" },
            button: { width: "100%" },
            nav_button_previous: { width: "32px", height: "32px" },
            nav_button_next: { width: "32px", height: "32px" },
            caption: { textTransform: "capitalize" },
          }}
        />
      </div>

      {/* 3. HORÁRIOS */}
      {date && (
        <div className="flex gap-3 overflow-x-auto py-6 px-5 border-b border-solid border-secondary [&::-webkit-scrollbar]:hidden">
          {timeList.map((time) => (
            <Button
              onClick={() => setHour(time)}
              variant={hour === time ? "default" : "outline"}
              className="rounded-full shrink-0"
              key={time}
            >
              {time}
            </Button>
          ))}
          {timeList.length === 0 && (
             <p className="text-gray-400 text-sm">Nenhum horário disponível com {barber.name} neste dia.</p>
          )}
        </div>
      )}

      {/* RODAPÉ E BOTÃO DE SUBMISSÃO */}
      <div className="p-5 border-t border-secondary mt-auto">
        <Button
          onClick={handleBookingSubmit}
          disabled={!hour || !date || submitIsLoading || timeList.length === 0}
          className="w-full"
        >
          {submitIsLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Confirmar Reagendamento
        </Button>
      </div>
    </div>
  );
};

export default QuickRebookingAction;