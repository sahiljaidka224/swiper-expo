import { differenceInDays, format, isToday, isYesterday } from "date-fns";

export function isActiveToday(timestamp: number): boolean {
  const date = new Date(timestamp * 1000);
  const now = new Date();

  return isToday(date) && differenceInDays(now, date) === 0;
}

export function formatTimestamp(timestamp: number, showRecently?: boolean): string {
  const date = new Date(timestamp * 1000);
  const now = new Date();

  const formatTime = (date: Date) => format(date, "hh:mm a").toUpperCase();

  if (isToday(date)) {
    return formatTime(date);
  }

  if (isYesterday(date)) {
    return "Yesterday";
  }

  const daysDifference = differenceInDays(now, date);
  if (daysDifference < 7) {
    return format(date, "EEEE");
  }

  if (showRecently) {
    return "Recently";
  }

  return format(date, "dd/MM/yy");
}

export function isOutgoingMessage(fromUID: string, currentUserUID: string) {
  return fromUID === currentUserUID;
}
