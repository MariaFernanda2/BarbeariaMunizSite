"use client";

import { Button } from "@/app/_components/ui/button";
import { Calendar } from "@/app/_components/ui/calendar";
import { Card, CardContent } from "@/app/_components/ui/card";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/app/_components/ui/sheet";

// Importamos 'Barber' do prisma, e 'Barbershop' e 'Service'
import { Barbershop, Booking, Service, Barber } from "@prisma/client"; 
import { ptBR } from "date-fns/locale";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { generateDayTimeList } from "../_helpers/hours";
import { addDays, format, setHours, setMinutes } from "date-fns";
import { saveBooking } from "../_actions/save-booking";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getDayBookings } from "../_actions/get-day-bookings";
import BookingInfo from "@/app/_components/booking-info";

// 💡 NOVO TIPO: Define a Barbershop incluindo a lista de Barbeiros (Barber[])
interface BarbershopWithBarbers extends Barbershop {
  barbers: Barber[];
}

interface ServiceItemProps {
  // Usamos o novo tipo, que agora casa com os dados carregados no page.tsx
  barbershop: BarbershopWithBarbers; 
  service: Service;
  isAuthenticated: boolean;
}

const ServiceItem = ({ service, barbershop, isAuthenticated }: ServiceItemProps) => {
  const router = useRouter();
  const { data } = useSession();

  const [date, setDate] = useState<Date | undefined>(undefined);
  const [hour, setHour] = useState<string | undefined>();
  
  // 1. NOVO ESTADO: Armazena o ID do barbeiro selecionado
  const [barberId, setBarberId] = useState<string | undefined>(); 

  const [submitIsLoading, setSubmitIsLoading] = useState(false);
  const [sheetIsOpen, setSheetIsOpen] = useState(false);
  const [dayBookings, setDayBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (!date) {
      return;
    }

    const refreshAvailableHours = async () => {
      const _dayBookings = await getDayBookings(barbershop.id, date);
      setDayBookings(_dayBookings);
    };

    refreshAvailableHours();
  }, [date, barbershop.id]);

  const handleDateClick = (date: Date | undefined) => {
    setDate(date);
    setHour(undefined);
  };

  const handleHourClick = (time: string) => {
    setHour(time);
  };

  const handleBookingClick = () => {
    if (!isAuthenticated) {
      return signIn("google");
    }
  };

  const handleBookingSubmit = async () => {
    setSubmitIsLoading(true);

    try {
      // 2. VALIDAÇÃO: Adicionar verificação se 'barberId' está selecionado
      if (!hour || !date || !data?.user || !barberId) {
        if (!barberId) {
            toast.error("Por favor, selecione um barbeiro para continuar.");
        }
        setSubmitIsLoading(false);
        return;
      }

      const dateHour = Number(hour.split(":")[0]);
      const dateMinutes = Number(hour.split(":")[1]);

      const newDate = setMinutes(setHours(date, dateHour), dateMinutes);

      await saveBooking({
        serviceId: service.id,
        barbershopId: barbershop.id,
        date: newDate,
        userId: (data.user as any).id,
        barberId: barberId, // 3. CORREÇÃO: Usar o ID do barbeiro do estado
      });

      // Resetar estados após a reserva
      setSheetIsOpen(false);
      setHour(undefined);
      setDate(undefined);
      setBarberId(undefined); 
      
      toast("Reserva realizada com sucesso!", {
        description: format(newDate, "'Para' dd 'de' MMMM 'às' HH':'mm'.'", {
          locale: ptBR,
        }),
        action: {
          label: "Visualizar",
          onClick: () => router.push("/bookings"),
        },
      });
    } catch (error) {
      console.error(error);
      toast.error("Ocorreu um erro ao tentar realizar a reserva.");
    } finally {
      setSubmitIsLoading(false);
    }
  };

  const timeList = useMemo(() => {
    if (!date) {
      return [];
    }

    return generateDayTimeList(date).filter((time) => {
      const timeHour = Number(time.split(":")[0]);
      const timeMinutes = Number(time.split(":")[1]);

      const booking = dayBookings.find((booking) => {
        const bookingHour = booking.date.getHours();
        const bookingMinutes = booking.date.getMinutes();

        return bookingHour === timeHour && bookingMinutes === timeMinutes;
      });

      if (!booking) {
        return true;
      }

      return false;
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
              
              <Sheet open={sheetIsOpen} onOpenChange={setSheetIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="secondary" onClick={handleBookingClick}>
                    Reservar
                  </Button>
                </SheetTrigger>

                <SheetContent className="p-0">
                  <SheetHeader className="text-left px-5 py-6 border-b border-solid border-secondary">
                    <SheetTitle>Fazer Reserva</SheetTitle>
                  </SheetHeader>

                  {/* 4. SELECT DE BARBEIROS ADICIONADO AQUI */}
                  <div className="py-6 px-5 border-b border-solid border-secondary">
                      <label className="text-sm font-medium">Selecione o Barbeiro</label>
                      <select
                          className="w-full border rounded-lg p-2 mt-2 bg-transparent text-sm"
                          value={barberId} 
                          onChange={(e) => setBarberId(e.target.value)} 
                      >
                          <option value={undefined}>Escolha um barbeiro</option>
                          {/* Mapeia a lista de barbeiros que veio do page.tsx */}
                          {barbershop.barbers?.map((barber) => (
                              <option key={barber.id} value={barber.id}>
                                  {barber.name}
                              </option>
                          ))}
                      </select>
                  </div>

                  <div className="py-6">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={handleDateClick}
                      locale={ptBR}
                      fromDate={addDays(new Date(), 1)}
                      styles={{
                        head_cell: {
                          width: "100%",
                          textTransform: "capitalize",
                        },
                        cell: {
                          width: "100%",
                        },
                        button: {
                          width: "100%",
                        },
                        nav_button_previous: {
                          width: "32px",
                          height: "32px",
                        },
                        nav_button_next: {
                          width: "32px",
                          height: "32px",
                        },
                        caption: {
                          textTransform: "capitalize",
                        },
                      }}
                    />
                  </div>

                  {/* Mostrar lista de horários apenas se alguma data estiver selecionada */}
                  {date && (
                    <div className="flex gap-3 overflow-x-auto py-6 px-5 border-t border-solid border-secondary [&::-webkit-scrollbar]:hidden">
                      {timeList.map((time) => (
                        <Button
                          onClick={() => handleHourClick(time)}
                          variant={hour === time ? "default" : "outline"}
                          className="rounded-full"
                          key={time}
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  )}

                  <div className="py-6 px-5 border-t border-solid border-secondary">
                    <BookingInfo
                      booking={{
                        barbershop: barbershop,
                        service: service,
                        date:
                          date && hour
                            ? setMinutes(setHours(date, Number(hour.split(":")[0])), Number(hour.split(":")[1]))
                            : undefined,
                      }}
                    />
                  </div>

                  <SheetFooter className="px-5">
                    {/* 5. Habilita o botão apenas se TUDO estiver preenchido: hora, data e barbeiro */}
                    <Button 
                      onClick={handleBookingSubmit} 
                      disabled={!hour || !date || !barberId || submitIsLoading}
                    >
                      {submitIsLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Confirmar reserva
                    </Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceItem;