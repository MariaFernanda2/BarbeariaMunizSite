export function buildBookingEndDate(
  startDate: Date,
  durationInMinutes: number
): Date {
  return new Date(startDate.getTime() + durationInMinutes * 60 * 1000);
}