import Header from "@/app/_components/header";
import BookingItem from "@/app/_components/booking-item";

import Search from "./search";
import BarbershopItem from "./barbershop-item";
import QuickRebookingBanner from "./quick-rebooking-banner";
import Carousel from "./carousel";
import EventsSection from "./events-section";

import Greeting from "../_components/greeting";
import SectionTitle from "../_components/section-title";

import type {
  BarbershopSummary,
  BookingSummary,
  CarouselItem,
} from "@/app/types/home.types";

interface CustomerHomeProps {
  session: any;
  recommendedBarbershops: BarbershopSummary[];
  confirmedBookings: BookingSummary[];
  lastCompletedBooking: BookingSummary | null;
  carouselItems: CarouselItem[];
}

export default function CustomerHome({
  session,
  recommendedBarbershops,
  confirmedBookings,
  lastCompletedBooking,
  carouselItems,
}: CustomerHomeProps) {
  return (
    <div>
      <Header />

      <div className="mt-6 px-5">
        <Search />
      </div>

      <Greeting userName={session?.user?.name} />

      {carouselItems.length > 0 && (
        <div className="mt-6">
          <SectionTitle>Confira nosso trabalho</SectionTitle>
          <Carousel items={carouselItems} />
          <EventsSection />
        </div>
      )}

      {lastCompletedBooking && (
        <QuickRebookingBanner lastBooking={lastCompletedBooking} />
      )}

      {confirmedBookings.length > 0 && (
        <div className="mt-6">
          <SectionTitle className="pl-5">Agendamentos</SectionTitle>

          <div className="flex gap-3 overflow-x-auto px-5">
            {confirmedBookings.map((booking) => (
              <BookingItem key={booking.id} booking={booking} />
            ))}
          </div>
        </div>
      )}

      <div className="mb-[4.5rem] mt-6">
        <SectionTitle>Unidades</SectionTitle>

        <div className="flex gap-4 overflow-x-auto px-5">
          {recommendedBarbershops.map((barbershop) => (
            <div key={barbershop.id} className="min-w-[167px] max-w-[167px]">
              <BarbershopItem barbershop={barbershop} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}