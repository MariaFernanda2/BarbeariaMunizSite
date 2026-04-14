import { format } from "date-fns";
import { fromZonedTime, toZonedTime, formatInTimeZone } from "date-fns-tz";

export const APP_TIME_ZONE = "America/Sao_Paulo";

export function buildUtcDateFromLocalSelection(
  selectedDate: Date,
  selectedHour: string,
  timeZone: string = APP_TIME_ZONE
): Date {
  const datePart = format(selectedDate, "yyyy-MM-dd");
  const localDateTime = `${datePart} ${selectedHour}:00`;

  return fromZonedTime(localDateTime, timeZone);
}

export function formatBookingInAppTimeZone(
  value: string | Date,
  pattern: string,
  timeZone: string = APP_TIME_ZONE
): string {
  return formatInTimeZone(value, timeZone, pattern);
}

export function toAppTimeZoneDate(
  value: string | Date,
  timeZone: string = APP_TIME_ZONE
): Date {
  return toZonedTime(value, timeZone);
}

export function buildUtcRangeFromLocalSelection(
  selectedDate: Date,
  startHour: string,
  endHour: string,
  timeZone: string = APP_TIME_ZONE
) {
  const startDate = buildUtcDateFromLocalSelection(
    selectedDate,
    startHour,
    timeZone
  );

  const endDate = buildUtcDateFromLocalSelection(
    selectedDate,
    endHour,
    timeZone
  );

  return {
    startDate,
    endDate,
  };
}