import type { Level } from "./types";

export type ResourceRow = {
  id: string;
  skill_id: string;
  title: string;
  url: string;
  platform: string;
  hours: number;
  level: Level;
  completion_rate: number;
};

export type PathRow = {
  id: string;
  skill_id: string;
  level: Level;
  title: string;
  resource_ids: string[];
};

/** Placement is a rule: the path whose level matches. */
export function pickPath(paths: readonly PathRow[], level: Level): PathRow | null {
  return paths.find((p) => p.level === level) ?? null;
}

/** Highest completion_rate first; ties keep the given order (Array.sort is stable). */
export function sortByCompletionRate<T extends { completion_rate: number }>(rows: readonly T[]): T[] {
  return [...rows].sort((a, b) => b.completion_rate - a.completion_rate);
}

/**
 * Turns a curated path into the ordered list a new learner gets:
 * the path's resources, sorted by completion_rate (stable on the curated order).
 */
export function assemblePath(path: PathRow, resources: readonly ResourceRow[]): ResourceRow[] {
  const byId = new Map(resources.map((r) => [r.id, r]));
  const ordered = path.resource_ids.flatMap((id) => {
    const row = byId.get(id);
    return row ? [row] : [];
  });
  return sortByCompletionRate(ordered);
}

/**
 * The swap rule for "This wasn't for me": another resource of the same skill and
 * level with fewer hours, not already in the learner's path, best-rated first.
 */
export function findShorterAlternative(
  current: ResourceRow,
  candidates: readonly ResourceRow[],
  excludeIds: readonly string[],
): ResourceRow | null {
  const excluded = new Set(excludeIds);
  const eligible = candidates.filter(
    (r) =>
      r.skill_id === current.skill_id &&
      r.level === current.level &&
      r.hours < current.hours &&
      !excluded.has(r.id),
  );
  return sortByCompletionRate(eligible)[0] ?? null;
}
