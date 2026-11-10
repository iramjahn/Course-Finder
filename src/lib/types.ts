export const LEVELS = ["beginner", "intermediate", "advanced"] as const;
export type Level = (typeof LEVELS)[number];

export const HOURS_OPTIONS = [1, 3, 5, 10] as const;
export type HoursPerWeek = (typeof HOURS_OPTIONS)[number];

export const EVENT_TYPES = ["started", "completed", "abandoned"] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export function isLevel(value: unknown): value is Level {
  return typeof value === "string" && (LEVELS as readonly string[]).includes(value);
}

export function isHoursPerWeek(value: unknown): value is HoursPerWeek {
  return typeof value === "number" && (HOURS_OPTIONS as readonly number[]).includes(value);
}
