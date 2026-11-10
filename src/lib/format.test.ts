import { describe, expect, it } from "vitest";
import { formatFinishCount, formatHours, minutesOf } from "./format";

describe("formatFinishCount", () => {
  it("says no one has tried when there are no events", () => {
    expect(formatFinishCount(0, 0)).toBe("No one has finished or dropped this yet");
  });
  it("shows people counts under 10 events", () => {
    expect(formatFinishCount(2, 1)).toBe("2 of 3 people finish this");
    expect(formatFinishCount(1, 0)).toBe("1 of 1 person finishes this");
    expect(formatFinishCount(0, 9)).toBe("0 of 9 people finish this");
  });
  it("switches to a percentage at 10 events", () => {
    expect(formatFinishCount(8, 2)).toBe("80% of people finish this");
    expect(formatFinishCount(2, 1, 10)).toBe("2 of 3 people finish this");
  });
});

describe("hours", () => {
  it("converts to minutes", () => {
    expect(minutesOf(0.14)).toBe(8);
    expect(minutesOf(2.44)).toBe(146);
  });
  it("formats short items in minutes and long ones in hours", () => {
    expect(formatHours(0.52)).toBe("31 min");
    expect(formatHours(1)).toBe("1 h");
    expect(formatHours(2.44)).toBe("2 h 26 min");
    expect(formatHours(30)).toBe("30 h");
  });
});
