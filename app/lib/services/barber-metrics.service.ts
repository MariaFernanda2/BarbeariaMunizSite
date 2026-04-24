import { BookingStatus } from "@prisma/client";

import { db } from "@/app/lib/repositories/prisma";

interface GetMetricsParams {
  barbershopId: string;
  startDate: Date;
  endDate: Date;
  previousStartDate: Date;
  previousEndDate: Date;
  barberId?: string;
}

interface ChartPoint {
  label: string;
  value: number;
}

interface ServiceBreakdownItem {
  name: string;
  value: number;
}

interface RevenueByBarberItem {
  name: string;
  value: number;
}

function formatDayLabel(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(date);
}

function formatDayKey(date: Date) {
  const formatter = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return formatter.format(date);
}

function buildDateRange(startDate: Date, endDate: Date) {
  const dates: Date[] = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    dates.push(new Date(current));
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return dates;
}

function getGrowthPercent(currentValue: number, previousValue: number) {
  if (previousValue === 0 && currentValue === 0) return 0;
  if (previousValue === 0) return 100;

  return ((currentValue - previousValue) / previousValue) * 100;
}

function buildClientKey(booking: {
  userId: string | null;
  clientPhone: string | null;
  clientName: string | null;
}) {
  return booking.userId ?? booking.clientPhone ?? booking.clientName ?? null;
}

function aggregateMetrics(
  bookings: Array<{
    date: Date;
    status: BookingStatus;
    userId: string | null;
    clientName: string | null;
    clientPhone: string | null;
    service: {
      name: string;
      price: unknown;
    };
    barber: {
      name: string;
    } | null;
  }>,
  startDate: Date,
  endDate: Date
) {
  const totalBookings = bookings.length;

  const completedBookings = bookings.filter(
    (booking) => booking.status === BookingStatus.COMPLETED
  );

  const confirmedBookings = bookings.filter(
    (booking) => booking.status === BookingStatus.CONFIRMED
  );

  const canceledBookings = bookings.filter(
    (booking) => booking.status === BookingStatus.CANCELED
  );

  const totalRevenue = completedBookings.reduce((total, booking) => {
    return total + Number(booking.finalPrice ?? booking.service.price ?? 0);
  }, 0);

  const averageTicket =
    completedBookings.length > 0
      ? totalRevenue / completedBookings.length
      : 0;

  const completionRate =
    totalBookings > 0 ? (completedBookings.length / totalBookings) * 100 : 0;

  const uniqueClients = new Set(
    bookings.map(buildClientKey).filter(Boolean)
  ).size;

  const recurringClientMap = new Map<string, number>();

  completedBookings.forEach((booking) => {
    const clientKey = buildClientKey(booking);
    if (!clientKey) return;

    recurringClientMap.set(
      clientKey,
      (recurringClientMap.get(clientKey) ?? 0) + 1
    );
  });

  const recurringClients = Array.from(recurringClientMap.values()).filter(
    (count) => count > 1
  ).length;

  const topServiceMap = new Map<string, number>();

  completedBookings.forEach((booking) => {
    const serviceName = booking.service.name;
    topServiceMap.set(serviceName, (topServiceMap.get(serviceName) ?? 0) + 1);
  });

  let topService = "-";
  let topServiceBookings = 0;

for (const [serviceName, count] of Array.from(topServiceMap.entries())) {
      if (count > topServiceBookings) {
      topService = serviceName;
      topServiceBookings = count;
    }
  }

  const serviceBreakdownMap = new Map<string, number>();

  completedBookings.forEach((booking) => {
    const serviceName = booking.service.name;
    serviceBreakdownMap.set(
      serviceName,
      (serviceBreakdownMap.get(serviceName) ?? 0) + 1
    );
  });

  const serviceBreakdown: ServiceBreakdownItem[] = Array.from(
    serviceBreakdownMap.entries()
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const barberRevenueMap = new Map<string, number>();

  completedBookings.forEach((booking) => {
    const barberName = booking.barber?.name ?? "Barbeiro";
    barberRevenueMap.set(
      barberName,
      (barberRevenueMap.get(barberName) ?? 0) + Number(booking.service.price ?? 0)
    );
  });

  const revenueByBarber: RevenueByBarberItem[] = Array.from(
    barberRevenueMap.entries()
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const dateRange = buildDateRange(startDate, endDate);

  const bookingsByDayMap = new Map<string, number>();
  const revenueByDayMap = new Map<string, number>();

  dateRange.forEach((date) => {
    const key = formatDayKey(date);
    bookingsByDayMap.set(key, 0);
    revenueByDayMap.set(key, 0);
  });

  bookings.forEach((booking) => {
    const key = formatDayKey(booking.date);
    bookingsByDayMap.set(key, (bookingsByDayMap.get(key) ?? 0) + 1);

    if (booking.status === BookingStatus.COMPLETED) {
      revenueByDayMap.set(
        key,
        (revenueByDayMap.get(key) ?? 0) + Number(booking.service.price ?? 0)
      );
    }
  });

  const bookingsChart: ChartPoint[] = dateRange.map((date) => {
    const key = formatDayKey(date);

    return {
      label: formatDayLabel(date),
      value: bookingsByDayMap.get(key) ?? 0,
    };
  });

  const revenueChart: ChartPoint[] = dateRange.map((date) => {
    const key = formatDayKey(date);

    return {
      label: formatDayLabel(date),
      value: revenueByDayMap.get(key) ?? 0,
    };
  });

  return {
    summary: {
      totalBookings,
      confirmedBookings: confirmedBookings.length,
      completedBookings: completedBookings.length,
      canceledBookings: canceledBookings.length,
      uniqueClients,
      recurringClients,
      totalRevenue,
      averageTicket,
      completionRate,
      topService,
      topServiceBookings,
    },
    charts: {
      bookings: bookingsChart,
      revenue: revenueChart,
      services: serviceBreakdown,
      revenueByBarber,
    },
  };
}

export async function getMetrics({
  barbershopId,
  startDate,
  endDate,
  previousStartDate,
  previousEndDate,
  barberId,
}: GetMetricsParams) {
  const whereBase = {
    barbershopId,
    ...(barberId ? { barberId } : {}),
  };

  const select = {
    date: true,
    status: true,
    userId: true,
    clientName: true,
    clientPhone: true,
    service: {
      select: {
        name: true,
        price: true,
      },
    },
    barber: {
      select: {
        name: true,
      },
    },
  } as const;

  const [currentBookings, previousBookings] = await Promise.all([
    db.booking.findMany({
      where: {
        ...whereBase,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select,
      orderBy: {
        date: "asc",
      },
    }),
    db.booking.findMany({
      where: {
        ...whereBase,
        date: {
          gte: previousStartDate,
          lte: previousEndDate,
        },
      },
      select,
      orderBy: {
        date: "asc",
      },
    }),
  ]);

  const current = aggregateMetrics(currentBookings, startDate, endDate);
  const previous = aggregateMetrics(
    previousBookings,
    previousStartDate,
    previousEndDate
  );

  return {
    filter: {
      barberId: barberId ?? null,
      mode: barberId ? "barber" : "general",
    },
    summary: {
      ...current.summary,
      growth: {
        revenuePercent: getGrowthPercent(
          current.summary.totalRevenue,
          previous.summary.totalRevenue
        ),
        bookingsPercent: getGrowthPercent(
          current.summary.totalBookings,
          previous.summary.totalBookings
        ),
        clientsPercent: getGrowthPercent(
          current.summary.uniqueClients,
          previous.summary.uniqueClients
        ),
      },
    },
    previous: {
      totalBookings: previous.summary.totalBookings,
      totalRevenue: previous.summary.totalRevenue,
      uniqueClients: previous.summary.uniqueClients,
    },
    charts: current.charts,
  };
}