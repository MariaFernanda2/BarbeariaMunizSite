import { endOfDay, endOfMonth, startOfDay, startOfMonth, subMonths } from "date-fns";
import { BarChart3, CalendarDays, TrendingUp, Users } from "lucide-react";

import { db } from "@/app/lib/repositories/prisma";
import type {
  BarberAction,
  BarberDashboardData,
  BarberMetric,
  SessionUser,
} from "@/app/types/home.types";

type GetBarberDashboardDataParams = {
  barberId: string;
  barbershopId?: string | null;
};

export async function getBarberDashboardData({
  barberId,
  barbershopId,
}: GetBarberDashboardDataParams): Promise<BarberDashboardData> {
  const now = new Date();

  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);

  const previousMonthDate = subMonths(now, 1);
  const previousMonthStart = startOfMonth(previousMonthDate);
  const previousMonthEnd = endOfMonth(previousMonthDate);

  const [
    todayBookingsCount,
    completedTodayCount,
    completedThisMonthBookings,
    completedLastMonthCount,
    completedBookingsAllTimeByUser,
    todayScheduleBlocksCount,
  ] = await Promise.all([
    db.booking.count({
      where: {
        barberId,
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
        status: {
          in: ["CONFIRMED", "COMPLETED"],
        },
      },
    }),

    db.booking.count({
      where: {
        barberId,
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
        status: "COMPLETED",
      },
    }),

    db.booking.findMany({
      where: {
        barberId,
        date: {
          gte: currentMonthStart,
          lte: currentMonthEnd,
        },
        status: "COMPLETED",
      },
      select: {
        id: true,
        userId: true,
        serviceId: true,
        service: {
          select: {
            name: true,
          },
        },
      },
    }),

    db.booking.count({
      where: {
        barberId,
        date: {
          gte: previousMonthStart,
          lte: previousMonthEnd,
        },
        status: "COMPLETED",
      },
    }),

    db.booking.groupBy({
      by: ["userId"],
      where: {
        barberId,
        status: "COMPLETED",
      },
      _count: {
        userId: true,
      },
    }),

    db.scheduleBlock.count({
      where: {
        barberId,
        ...(barbershopId ? { barbershopId } : {}),
        startDate: {
          lte: todayEnd,
        },
        endDate: {
          gte: todayStart,
        },
      },
    }),
  ]);

  const monthClientsCount = new Set(
    completedThisMonthBookings.map((booking) => booking.userId)
  ).size;

  const recurringClientsCount = completedBookingsAllTimeByUser.filter(
    (item) => item._count.userId > 1
  ).length;

  const currentMonthCompletedCount = completedThisMonthBookings.length;

  const growthPercent =
    completedLastMonthCount === 0
      ? currentMonthCompletedCount > 0
        ? 100
        : 0
      : Math.round(
          ((currentMonthCompletedCount - completedLastMonthCount) /
            completedLastMonthCount) *
            100
        );

  const servicesCounter = new Map<string, number>();

  for (const booking of completedThisMonthBookings) {
    const serviceName = booking.service?.name ?? "Serviço";

    servicesCounter.set(serviceName, (servicesCounter.get(serviceName) ?? 0) + 1);
  }

  const entries = Array.from(servicesCounter.entries());

const topService =
  entries.sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Sem dados";

  const heroStats = {
    todayBookings: todayBookingsCount,
    completedToday: completedTodayCount,
    monthClients: monthClientsCount,
    growthPercent,
  };

  const metrics: BarberMetric[] = [
    {
      title: "Agendamentos hoje",
      value: String(todayBookingsCount),
      subtitle: `${completedTodayCount} concluídos hoje`,
      icon: CalendarDays,
    },
    {
      title: "Clientes no mês",
      value: String(monthClientsCount),
      subtitle: "Clientes únicos atendidos",
      icon: Users,
    },
    {
      title: "Crescimento",
      value: `${growthPercent >= 0 ? "+" : ""}${growthPercent}%`,
      subtitle: "Comparado ao mês passado",
      icon: TrendingUp,
    },
    {
      title: "Bloqueios hoje",
      value: String(todayScheduleBlocksCount),
      subtitle: "Bloqueios cadastrados na agenda",
      icon: BarChart3,
    },
  ];

  const actions: BarberAction[] = [
    {
      title: "Minha agenda",
      description: "Visualize sua agenda diária e acompanhe seus horários marcados.",
      href: `/dashboard/barbershop/${barbershopId ?? "1"}`,
      cta: "Abrir agenda",
      icon: CalendarDays,
    },
    {
      title: "Novo agendamento",
      description: "Crie rapidamente um novo horário para clientes e encaixes.",
      href: `/dashboard/barbershop/${barbershopId ?? "1"}`,
      cta: "Criar agora",
      icon: CalendarDays,
    },
    {
      title: "Relatórios",
      description: "Acompanhe seus números, desempenho e evolução no período.",
      href: "",
      cta: "Ver relatórios",
      icon: BarChart3,
      tone: "secondary",
    },
  ];

  return {
    heroStats,
    metrics,
    actions,
    performance: {
      topService,
      recurringClients: recurringClientsCount,
      todayBlocks: todayScheduleBlocksCount,
    },
  };
}

export async function getBarberDashboardDataFromUser(
  user?: SessionUser
): Promise<BarberDashboardData | null> {
  if (!user?.barberId) {
    return null;
  }

  return getBarberDashboardData({
    barberId: user.barberId,
    barbershopId: user.barbershopId,
  });
}




