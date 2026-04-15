"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

import BookingInfo from "./booking-info";
import type { BookingSummary } from "@/app/types/home.types";
import {
  APP_TIME_ZONE,
  formatBookingInAppTimeZone,
} from "@/app/lib/utils/timezone";

interface BookingItemProps {
  booking: BookingSummary;
}

function getStatusLabel(status: BookingSummary["status"]) {
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

function getStatusVariant(
  status: BookingSummary["status"]
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "CONFIRMED":
      return "default";
    case "COMPLETED":
      return "secondary";
    case "CANCELED":
      return "destructive";
    default:
      return "outline";
  }
}

function canCancelBooking(status: BookingSummary["status"]) {
  return status === "CONFIRMED";
}

const BookingItem = ({ booking }: BookingItemProps) => {
  const [isCancelLoading, setIsCancelLoading] = useState(false);

  const statusLabel = getStatusLabel(booking.status);
  const statusVariant = getStatusVariant(booking.status);
  const canCancel = canCancelBooking(booking.status);

  const bookingMonth = formatBookingInAppTimeZone(
    booking.date,
    "MMMM",
    APP_TIME_ZONE
  );

  const bookingDay = formatBookingInAppTimeZone(
    booking.date,
    "dd",
    APP_TIME_ZONE
  );

  const bookingHour = formatBookingInAppTimeZone(
    booking.date,
    "HH:mm",
    APP_TIME_ZONE
  );

  const handleCancelClick = async () => {
    setIsCancelLoading(true);

    try {
      const response = await fetch(`/api/v1/bookings/${booking.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao cancelar reserva.");
      }

      toast.success("Reserva cancelada com sucesso!");
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao cancelar reserva.");
    } finally {
      setIsCancelLoading(false);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Card className="min-w-full cursor-pointer transition hover:opacity-95">
          <CardContent className="flex px-0 py-0">
            <div className="flex flex-[3] flex-col gap-2 py-5 pl-5">
              <Badge variant={statusVariant} className="w-fit">
                {statusLabel}
              </Badge>

              <h2 className="font-bold">{booking.service.name}</h2>

              <p className="flex items-center gap-1 text-sm text-gray-400">
                👤 {booking.barber.name}
              </p>

              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={booking.barbershop.imageUrl ?? undefined} />
                  <AvatarFallback>
                    {booking.barbershop.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <h3 className="text-sm">{booking.barbershop.name}</h3>
              </div>
            </div>

            <div className="flex flex-1 flex-col items-center justify-center border-l border-solid border-secondary">
              <p className="text-sm capitalize">{bookingMonth}</p>
              <p className="text-2xl">{bookingDay}</p>
              <p className="text-sm">{bookingHour}</p>
            </div>
          </CardContent>
        </Card>
      </SheetTrigger>

      <SheetContent className="px-0">
        <SheetHeader className="border-b border-solid border-secondary px-5 pb-6 text-left">
          <SheetTitle>Informações da Reserva</SheetTitle>
        </SheetHeader>

        <div className="px-5">
          <div className="relative mt-6 h-[180px] w-full">
            <Image
              src="/barbershop-map.png"
              fill
              alt={booking.barbershop.name}
            />

            <div className="absolute bottom-4 left-0 w-full px-5">
              <Card>
                <CardContent className="flex gap-2 p-3">
                  <Avatar>
                    <AvatarImage src={booking.barbershop.imageUrl ?? undefined} />
                    <AvatarFallback>
                      {booking.barbershop.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <h2 className="font-bold">{booking.barbershop.name}</h2>
                    <h3 className="overflow-hidden text-ellipsis text-nowrap text-xs">
                      {booking.barbershop.address}
                    </h3>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Badge variant={statusVariant} className="my-3 w-fit">
            {statusLabel}
          </Badge>

          <p className="mb-3 text-sm text-gray-400">
            👤 Barbeiro: {booking.barber.name}
          </p>

          <BookingInfo booking={booking} />

          <SheetFooter className="mt-6 flex-row gap-3">
            <SheetClose asChild>
              <Button className="w-full" variant="secondary">
                Voltar
              </Button>
            </SheetClose>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  disabled={!canCancel || isCancelLoading}
                  className="w-full"
                  variant="destructive"
                >
                  Cancelar Reserva
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent className="w-[90%]">
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Deseja mesmo cancelar essa reserva?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Uma vez cancelada, não será possível reverter essa ação.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter className="flex-row gap-3">
                  <AlertDialogCancel className="mt-0 w-full">
                    Voltar
                  </AlertDialogCancel>

                  <AlertDialogAction
                    disabled={isCancelLoading}
                    className="w-full"
                    onClick={handleCancelClick}
                  >
                    {isCancelLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Confirmar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default BookingItem;