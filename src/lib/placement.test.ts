import { describe, expect, it } from "vitest";
import { assemblePath, findShorterAlternative, pickPath, type PathRow, type ResourceRow } from "./placement";

const skill = "s1";
const paths: PathRow[] = [
  { id: "p-b", skill_id: skill, level: "beginner", title: "B", resource_ids: ["r1", "r2"] },
  { id: "p-i", skill_id: skill, level: "intermediate", title: "I", resource_ids: ["r3"] },
  { id: "p-a", skill_id: skill, level: "advanced", title: "A", resource_ids: ["r4"] },
];

const res = (id: string, hours: number, completion_rate: number, level: ResourceRow["level"] = "beginner"): ResourceRow => ({
  id,
  skill_id: skill,
  title: id,
  url: `https://example.com/${id}`,
  platform: "YouTube",
  hours,
  level,
  completion_rate,
});

describe("pickPath", () => {
  it.each(["beginner", "intermediate", "advanced"] as const)("returns the %s path", (level) => {
    expect(pickPath(paths, level)?.level).toBe(level);
  });
  it("returns null when no path matches", () => {
    expect(pickPath(paths.slice(0, 1), "advanced")).toBeNull();
  });
});

describe("assemblePath", () => {
  it("keeps curated order when rates tie (stable)", () => {
    const path: PathRow = { ...paths[0], resource_ids: ["r1", "r2", "r3"] };
    const pool = [res("r3", 1, 0.5), res("r1", 1, 0.5), res("r2", 1, 0.5)];
    expect(assemblePath(path, pool).map((r) => r.id)).toEqual(["r1", "r2", "r3"]);
  });
  it("puts the highest completion_rate first", () => {
    const path: PathRow = { ...paths[0], resource_ids: ["r1", "r2", "r3"] };
    const pool = [res("r1", 1, 0.5), res("r2", 1, 0.9), res("r3", 1, 0.5)];
    expect(assemblePath(path, pool).map((r) => r.id)).toEqual(["r2", "r1", "r3"]);
  });
  it("drops ids with no resource row", () => {
    const path: PathRow = { ...paths[0], resource_ids: ["r1", "missing"] };
    expect(assemblePath(path, [res("r1", 1, 0.5)]).map((r) => r.id)).toEqual(["r1"]);
  });
});

describe("findShorterAlternative", () => {
  const current = res("cur", 1.5, 0.5);
  it("picks the best-rated shorter resource of the same level not already in the path", () => {
    const pool = [
      current,
      res("long", 2, 0.9),
      res("short-low", 0.5, 0.4),
      res("short-high", 1, 0.8),
      res("short-other-level", 0.25, 0.95, "advanced"),
      res("in-path", 0.25, 0.99),
    ];
    const pick = findShorterAlternative(current, pool, ["cur", "in-path"]);
    expect(pick?.id).toBe("short-high");
  });
  it("returns null when nothing shorter exists", () => {
    expect(findShorterAlternative(current, [current, res("long", 3, 0.9)], ["cur"])).toBeNull();
  });
  it("is stable on ties", () => {
    const pool = [current, res("t2", 1, 0.5), res("t1", 1, 0.5)];
    expect(findShorterAlternative(current, pool, ["cur"])?.id).toBe("t2");
  });
});
