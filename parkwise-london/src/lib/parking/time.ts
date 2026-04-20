export type LondonTimeSnapshot = {
  day: number;
  hour: number;
  label: string;
};

export function getLondonTimeSnapshot(date = new Date()): LondonTimeSnapshot {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).formatToParts(date);

  const weekday = parts.find((part) => part.type === "weekday")?.value ?? "Mon";
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? "0");

  const weekdayIndex = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(weekday);

  return {
    day: weekdayIndex === -1 ? 1 : weekdayIndex,
    hour: hour + minute / 60,
    label: new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/London",
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hourCycle: "h23",
    }).format(date),
  };
}
