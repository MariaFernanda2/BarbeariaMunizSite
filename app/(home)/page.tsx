import { getServerSession } from "next-auth";

import { authOptions } from "@/app/lib/auth";

import BarberHome from "./_components/barber-home";
import CustomerHome from "./_components/customer-home";
import { getBarberDashboardDataFromUser } from "./_data/get-barber-dashboard-data";
import { getHomeData } from "./_data/get-home-data";
import type { SessionUser } from "@/app/types/home.types";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;

  if (user?.role === "BARBER") {
    const barberDashboardData = await getBarberDashboardDataFromUser(user);

    if (!barberDashboardData) {
      return (
        <BarberHome
          user={user}
          data={{
            heroStats: {
              todayBookings: 0,
              completedToday: 0,
              monthClients: 0,
              growthPercent: 0,
            },
            metrics: [],
            actions: [],
            performance: {
              topService: "Sem dados",
              recurringClients: 0,
              todayBlocks: 0,
            },
          }}
        />
      );
    }

    return <BarberHome user={user} data={barberDashboardData} />;
  }

  const {
    recommendedBarbershops,
    confirmedBookings,
    lastCompletedBooking,
    carouselItems,
  } = await getHomeData(user?.id);

  return (
    <CustomerHome
      session={session}
      recommendedBarbershops={recommendedBarbershops}
      confirmedBookings={confirmedBookings}
      lastCompletedBooking={lastCompletedBooking}
      carouselItems={carouselItems}
    />
  );
}