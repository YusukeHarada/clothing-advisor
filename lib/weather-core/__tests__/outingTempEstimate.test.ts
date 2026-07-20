import { describe, expect, it } from "vitest";
import { estimateOutingTemp } from "../outingTempEstimate";

describe("estimateOutingTemp", () => {
  it("returns tempMin for an early-morning window before 05:00", () => {
    expect(estimateOutingTemp(30, 20, { start: "03:00", end: "04:00" })).toBe(20);
  });

  it("returns tempMax for a midday window centered on 14:00", () => {
    expect(estimateOutingTemp(30, 20, { start: "13:30", end: "14:30" })).toBe(30);
  });

  it("interpolates between tempMin and tempMax during the morning rise", () => {
    // 09:30 is the midpoint of the rise from 05:00 to 14:00 (about 50%)
    const result = estimateOutingTemp(30, 20, { start: "09:00", end: "10:00" });
    expect(result).toBeGreaterThan(20);
    expect(result).toBeLessThan(30);
  });

  it("interpolates between tempMax and tempMin during the evening fall", () => {
    const result = estimateOutingTemp(30, 20, { start: "18:00", end: "19:00" });
    expect(result).toBeGreaterThan(20);
    expect(result).toBeLessThan(30);
  });

  it("handles overnight windows where end is before start", () => {
    const result = estimateOutingTemp(30, 20, { start: "22:00", end: "02:00" });
    expect(result).toBe(20); // 深夜帯なのでtempMin付近
  });
});
