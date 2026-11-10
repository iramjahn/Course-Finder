import { describe, expect, it } from "vitest";
import { safeNext } from "./safe-next";

describe("safeNext", () => {
  it("keeps same-site paths", () => {
    expect(safeNext("/today")).toBe("/today");
    expect(safeNext("/learn/excel/beginner?x=1#y")).toBe("/learn/excel/beginner?x=1#y");
  });
  it("rejects anything that could leave the site", () => {
    expect(safeNext("//evil.com")).toBe("/today");
    expect(safeNext("/\\evil.com")).toBe("/today");
    expect(safeNext("https://evil.com")).toBe("/today");
    expect(safeNext("/ok path")).toBe("/today");
    expect(safeNext(null)).toBe("/today");
    expect(safeNext("")).toBe("/today");
  });
});
