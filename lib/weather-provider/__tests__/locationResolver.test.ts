import { describe, expect, it } from "vitest";
import { resolveLocation, UnknownLocationError } from "../locationResolver";

describe("resolveLocation", () => {
  it("resolves a known location to its area code", () => {
    expect(resolveLocation("tokyo").areaCode).toBe("130000");
  });

  it("resolves ibaraki-south to Ibaraki's area code with the south sub-area and Ryugasaki amedas station", () => {
    const ibarakiSouth = resolveLocation("ibaraki-south");
    expect(ibarakiSouth.areaCode).toBe("080000");
    expect(ibarakiSouth.subAreaCode).toBe("080020");
    expect(ibarakiSouth.amedasStationCode).toBe("40426");
  });

  it("throws UnknownLocationError for an unregistered locationId", () => {
    expect(() => resolveLocation("nowhere")).toThrow(UnknownLocationError);
  });
});
