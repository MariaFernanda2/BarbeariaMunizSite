"use client";

import { useState } from "react";
import { Button } from "@/app/_components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/app/_components/ui/sheet";
import { CalendarIcon, Gift } from "lucide-react";

import QuickRebookingAction, {
  LastBooking,
} from "./quick-rebooking-action";

interface QuickRebookingBannerProps {
  lastBooking: LastBooking;
}

const QuickRebookingBanner = ({
  lastBooking,
}: QuickRebookingBannerProps) => {
  const [sheetIsOpen, setSheetIsOpen] = useState(false);

  return (
    <>
      {/* 🔹 Banner */}
      <div className="bg-primary text-white p-4 mx-5 mt-6 rounded-lg shadow-xl flex items-center justify-between gap-3">
        <div className="flex flex-col flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">
            Reagendar com {lastBooking.barber.name}?
          </p>

          <div className="flex items-center gap-1 mt-1">
            <Gift className="h-4 w-4 text-yellow-300 shrink-0" />
            <p className="text-xs text-yellow-300 font-medium truncate">
              6 cortes no mês = 🎁 Brinde na hora!
            </p>
          </div>
        </div>

        <Button
          className="shrink-0 font-bold px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-auto"
          onClick={() => setSheetIsOpen(true)}
          aria-label={`Reagendar ${lastBooking.service.name} com ${lastBooking.barber.name}`}
        >
          <CalendarIcon className="h-4 w-4 mr-2" />
          Agendar Rápido
        </Button>
      </div>

      {/* 🔹 Modal */}
      <Sheet open={sheetIsOpen} onOpenChange={setSheetIsOpen}>
        <SheetTrigger asChild>
          <Button className="hidden" aria-hidden />
        </SheetTrigger>

        <SheetContent className="p-0 flex flex-col h-full">
          <SheetHeader className="text-left px-5 py-6 border-b border-secondary">
            <SheetTitle>Agendar Novamente</SheetTitle>
          </SheetHeader>

          <QuickRebookingAction
            lastBooking={lastBooking}
            setSheetIsOpen={setSheetIsOpen}
          />
        </SheetContent>
      </Sheet>
    </>
  );
};

export default QuickRebookingBanner;
