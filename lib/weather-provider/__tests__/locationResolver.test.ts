import { describe, expect, it } from "vitest";
import { resolveLocation, UnknownLocationError } from "../locationResolver";

describe("resolveLocation", () => {
  it("resolves a known location to its area code", () => {
    expect(resolveLocation("tokyo").areaCode).toBe("130000");
  });

  it("throws UnknownLocationError for an unregistered locationId", () => {
    expect(() => resolveLocation("nowhere")).toThrow(UnknownLocationError);
  });
});
