import {
  endOfDay,
  endOfMonth,
  startOfDay,
  startOfMonth,
  subDays,
} from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";

export const APP_TIME_ZONE = "America/Sao_Paulo";

export type MetricsPeriod = "today" | "7d" | "30d" | "month";

export interface MetricsDateRange {
  startDate: Date;
  endDate: Date;
  previousStartDate: Date;
  previousEndDate: Date;
  period: MetricsPeriod;
  label: string;
}

export const METRICS_PERIOD_OPTIONS: Array<{
  value: MetricsPeriod;
  label: string;
}> = [
  { value: "today", label: "Hoje" },
  { value: "7d", label: "7 dias" },
  { value: "30d", label: "30 dias" },
  { value: "month", label: "Mês atual" },
];

export function parseMetricsPeriod(value?: string): MetricsPeriod {
  if (value === "today") return "today";
  if (value === "7d") return "7d";
  if (value === "30d") return "30d";
  return "month";
}

export function getMetricsDateRange(
  periodInput?: string,
  timeZone: string = APP_TIME_ZONE
): MetricsDateRange {
  const period = parseMetricsPeriod(periodInput);
  const zonedNow = toZonedTime(new Date(), timeZone);

  let currentStartZoned: Date;
  let currentEndZoned: Date;
  let previousStartZoned: Date;
  let previousEndZoned: Date;
  let label: string;

  switch (period) {
    case "today": {
      currentStartZoned = startOfDay(zonedNow);
      currentEndZoned = endOfDay(zonedNow);

      previousStartZoned = startOfDay(subDays(zonedNow, 1));
      previousEndZoned = endOfDay(subDays(zonedNow, 1));

      label = "Hoje";
      break;
    }

    case "7d": {
      currentStartZoned = startOfDay(subDays(zonedNow, 6));
      currentEndZoned = endOfDay(zonedNow);

      previousStartZoned = startOfDay(subDays(currentStartZoned, 7));
      previousEndZoned = endOfDay(subDays(currentStartZoned, 1));

      label = "Últimos 7 dias";
      break;
    }

    case "30d": {
      currentStartZoned = startOfDay(subDays(zonedNow, 29));
      currentEndZoned = endOfDay(zonedNow);

      previousStartZoned = startOfDay(subDays(currentStartZoned, 30));
      previousEndZoned = endOfDay(subDays(currentStartZoned, 1));

      label = "Últimos 30 dias";
      break;
    }

    case "month":
    default: {
      currentStartZoned = startOfMonth(zonedNow);
      currentEndZoned = endOfDay(zonedNow);

      const previousMonthReference = subDays(currentStartZoned, 1);
      previousStartZoned = startOfMonth(previousMonthReference);
      previousEndZoned = endOfMonth(previousMonthReference);

      label = "Mês atual";
      break;
    }
  }

  return {
    period,
    label,
    startDate: fromZonedTime(currentStartZoned, timeZone),
    endDate: fromZonedTime(currentEndZoned, timeZone),
    previousStartDate: fromZonedTime(previousStartZoned, timeZone),
    previousEndDate: fromZonedTime(previousEndZoned, timeZone),
  };
}