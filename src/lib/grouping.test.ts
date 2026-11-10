import { describe, expect, it } from "vitest";
import { groupIntoWeeks, WEEK_CAP_FACTOR, type PathItem } from "./grouping";

const items: PathItem[] = [
  { id: "a", hours: 0.14 },
  { id: "b", hours: 0.52 },
  { id: "c", hours: 1.5 },
  { id: "d", hours: 0.5 },
  { id: "e", hours: 0.88 },
  { id: "f", hours: 2.44 },
  { id: "g", hours: 0.23 },
  { id: "h", hours: 0.5 },
  { id: "i", hours: 11 },
];

const EPS = 1e-9;
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

describe("groupIntoWeeks", () => {
  it("returns no weeks for an empty path", () => {
    expect(groupIntoWeeks([], 3)).toEqual([]);
  });

  it.each([1, 3, 5, 10])("never exceeds 1.2x for %i h/week", (hpw) => {
    const weeks = groupIntoWeeks(items, hpw);
    const cap = hpw * WEEK_CAP_FACTOR;
    for (const w of weeks) expect(w.hours).toBeLessThanOrEqual(cap + EPS);
  });

  it.each([1, 3, 5, 10])("keeps the order and total hours for %i h/week", (hpw) => {
    const weeks = groupIntoWeeks(items, hpw);
    const ids = weeks.flatMap((w) => w.items.map((i) => i.id));
    // collapse consecutive repeats (a resource split across weeks)
    const collapsed = ids.filter((id, i) => i === 0 || ids[i - 1] !== id);
    expect(collapsed).toEqual(items.map((i) => i.id));
    expect(sum(weeks.flatMap((w) => w.items.map((i) => i.hours)))).toBeCloseTo(sum(items.map((i) => i.hours)), 6);
    weeks.forEach((w, i) => expect(w.week).toBe(i + 1));
  });

  it("packs greedily: 1 h/week puts 0.14 + 0.52 + 0.5 together but not 1.5", () => {
    const weeks = groupIntoWeeks(
      [
        { id: "a", hours: 0.14 },
        { id: "b", hours: 0.52 },
        { id: "d", hours: 0.5 },
        { id: "c", hours: 1.5 },
      ],
      1,
    );
    expect(weeks[0].items.map((i) => i.id)).toEqual(["a", "b", "d"]);
    expect(weeks[0].hours).toBeCloseTo(1.16);
    expect(weeks[1].items[0].id).toBe("c");
  });

  it("lets a resource exactly at the cap fill a week", () => {
    const weeks = groupIntoWeeks([{ id: "x", hours: 3.6 }], 3);
    expect(weeks).toHaveLength(1);
    expect(weeks[0].items[0].partial).toBeUndefined();
  });

  it("spans an oversized resource across consecutive weeks", () => {
    const weeks = groupIntoWeeks([{ id: "big", hours: 11 }, { id: "tail", hours: 0.5 }], 5);
    // 11 h at 5 h/week → 5, 5, 1 ; tail (0.5) joins the last chunk's week (1.5 ≤ 6)
    expect(weeks.map((w) => w.items.map((i) => `${i.id}:${i.hours}`))).toEqual([
      ["big:5"],
      ["big:5"],
      ["big:1", "tail:0.5"],
    ]);
    expect(weeks[0].items[0].partial).toBe(true);
    expect(weeks[2].items[0].partial).toBe(true);
  });

  it("rejects a non-positive weekly budget", () => {
    expect(() => groupIntoWeeks(items, 0)).toThrow();
  });
});
