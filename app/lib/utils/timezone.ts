import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

export const APP_TIME_ZONE = "America/Sao_Paulo";

/**
 * Recebe a data escolhida no calendário + hora local ("HH:mm")
 * e devolve um Date em UTC para salvar no banco.
 *
 * Exemplo:
 * 14/04/2026 + "20:05" em America/Sao_Paulo
 * => salva como 2026-04-14T23:05:00.000Z
 */
export function buildUtcDateFromLocalSelection(
  selectedDate: Date,
  selectedHour: string,
  timeZone: string = APP_TIME_ZONE
): Date {
  const datePart = formatInTimeZone(selectedDate, timeZone, "yyyy-MM-dd");
  const localDateTime = `${datePart} ${selectedHour}:00`;

  return fromZonedTime(localDateTime, timeZone);
}

/**
 * Formata uma data UTC do banco para o fuso da aplicação.
 *
 * Use esta função DIRETO para mostrar na tela.
 * Não converta antes com toZonedTime.
 */
export function formatBookingInAppTimeZone(
  value: string | Date,
  pattern: string,
  timeZone: string = APP_TIME_ZONE
): string {
  return formatInTimeZone(value, timeZone, pattern);
}

/**
 * Monta um intervalo UTC para bloqueios/agendamentos.
 */
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