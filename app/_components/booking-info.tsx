import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent } from "./ui/card";

import type { BookingPreview } from "@/app/types/home.types";

interface BookingInfoProps {
  booking: BookingPreview;
}

const BookingInfo = ({ booking }: BookingInfoProps) => {
  const bookingDate = booking.date ? new Date(booking.date) : null;
  const bookingPrice = Number(booking.finalPrice ?? 0);

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-3">
        <div className="flex justify-between">
          <h2 className="font-bold">{booking.service.name}</h2>

          <h3 className="text-sm font-bold">
            {Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(bookingPrice)}
          </h3>
        </div>

        {bookingDate && (
          <>
            <div className="flex justify-between">
              <h3 className="text-sm text-gray-400">Data</h3>
              <h4 className="text-sm">
                {format(bookingDate, "dd 'de' MMMM", {
                  locale: ptBR,
                })}
              </h4>
            </div>

            <div className="flex justify-between">
              <h3 className="text-sm text-gray-400">Horário</h3>
              <h4 className="text-sm">{format(bookingDate, "HH:mm")}</h4>
            </div>
          </>
        )}

        <div className="flex justify-between">
          <h3 className="text-sm text-gray-400">Barbearia</h3>
          <h4 className="text-sm">{booking.barbershop.name}</h4>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingInfo;