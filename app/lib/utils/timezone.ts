import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

export const APP_TIME_ZONE = "America/Sao_Paulo";

export function buildUtcDateFromLocalSelection(
  selectedDate: Date,
  selectedHour: string,
  timeZone: string = APP_TIME_ZONE
): Date {
  const datePart = formatInTimeZone(selectedDate, timeZone, "yyyy-MM-dd");
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

export function buildUtcRangeFromLocalSelection(
  selectedDate: Date,
  startHour: string,
  endHour: string,
  timeZone: string = APP_TIME_ZONE
) {
  return {
    startDate: buildUtcDateFromLocalSelection(selectedDate, startHour, timeZone),
    endDate: buildUtcDateFromLocalSelection(selectedDate, endHour, timeZone),
  };
}