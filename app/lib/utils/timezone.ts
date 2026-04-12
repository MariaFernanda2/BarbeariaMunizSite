import { format } from "date-fns";
import { fromZonedTime, toZonedTime, formatInTimeZone } from "date-fns-tz";

export const APP_TIME_ZONE = "America/Sao_Paulo";

/**
 * Recebe uma data escolhida no calendário + hora "HH:mm"
 * e converte para um Date UTC pronto para salvar no banco.
 */
export function buildUtcDateFromLocalSelection(
  selectedDate: Date,
  selectedHour: string,
  timeZone: string = APP_TIME_ZONE
): Date {
  const datePart = format(selectedDate, "yyyy-MM-dd");
  const localDateTime = `${datePart} ${selectedHour}:00`;

  return fromZonedTime(localDateTime, timeZone);
}

/**
 * Formata um valor UTC do banco no fuso da aplicação.
 */
export function formatBookingInAppTimeZone(
  value: string | Date,
  pattern: string,
  timeZone: string = APP_TIME_ZONE
): string {
  return formatInTimeZone(value, timeZone, pattern);
}

/**
 * Converte uma data UTC do banco para Date no fuso da aplicação.
 */
export function toAppTimeZoneDate(
  value: string | Date,
  timeZone: string = APP_TIME_ZONE
): Date {
  return toZonedTime(value, timeZone);
}