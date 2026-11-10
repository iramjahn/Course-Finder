/** A week may hold at most this multiple of the learner's weekly hours. */
export const WEEK_CAP_FACTOR = 1.2;

const EPSILON = 1e-9;

export type PathItem = { id: string; hours: number };

export type WeekItem = PathItem & {
  /** Set when a resource is longer than one week and this is one slice of it. */
  partial?: true;
};

export type Week = { week: number; items: WeekItem[]; hours: number };

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Groups an ordered path into weeks. Order is preserved. No week exceeds
 * `hoursPerWeek * WEEK_CAP_FACTOR`. A resource longer than the cap spans
 * consecutive weeks: `hoursPerWeek` per week, the remainder in the last one.
 */
export function groupIntoWeeks(items: readonly PathItem[], hoursPerWeek: number): Week[] {
  if (!(hoursPerWeek > 0)) throw new Error("hoursPerWeek must be positive");
  const cap = hoursPerWeek * WEEK_CAP_FACTOR;

  const weeks: Week[] = [];
  let current: WeekItem[] = [];
  let currentHours = 0;

  const closeWeek = () => {
    if (current.length === 0) return;
    weeks.push({ week: weeks.length + 1, items: current, hours: round2(currentHours) });
    current = [];
    currentHours = 0;
  };

  const place = (item: WeekItem) => {
    if (currentHours + item.hours > cap + EPSILON) closeWeek();
    current = [...current, item];
    currentHours += item.hours;
  };

  for (const item of items) {
    if (item.hours <= cap + EPSILON) {
      place(item);
      continue;
    }
    // Oversized: slice off full weeks of hoursPerWeek, then place the remainder like a normal item.
    closeWeek();
    let remaining = item.hours;
    while (remaining > hoursPerWeek + EPSILON) {
      weeks.push({ week: weeks.length + 1, items: [{ ...item, hours: hoursPerWeek, partial: true }], hours: hoursPerWeek });
      remaining = round2(remaining - hoursPerWeek);
    }
    if (remaining > EPSILON) place({ ...item, hours: remaining, partial: true });
  }
  closeWeek();
  return weeks;
}

export function totalHours(items: readonly PathItem[]): number {
  return round2(items.reduce((sum, i) => sum + i.hours, 0));
}
