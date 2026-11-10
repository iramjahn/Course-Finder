/** Below this many events we show people counts instead of a percentage. */
export const COUNT_THRESHOLD = 10;

export function formatFinishCount(completed: number, abandoned: number, threshold = COUNT_THRESHOLD): string {
  const total = completed + abandoned;
  if (total === 0) return "No one has finished or dropped this yet";
  if (total < threshold) {
    const verb = total === 1 ? "person finishes" : "people finish";
    return `${completed} of ${total} ${verb} this`;
  }
  return `${Math.round((completed / total) * 100)}% of people finish this`;
}

export function minutesOf(hours: number): number {
  return Math.round(hours * 60);
}

export function formatHours(hours: number): string {
  const minutes = minutesOf(hours);
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

export function formatRate(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}
