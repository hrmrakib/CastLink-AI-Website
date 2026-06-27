export function formatAvailabilityDate(dateStr: string): {
  day: string;
  date: string;
  isPast?: boolean;
} {
  const d = new Date(`${dateStr}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return {
    day: d.toLocaleDateString("en-US", { weekday: "long" }),
    date: d.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    isPast: d < today,
  };
}
