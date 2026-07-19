import { describe, expect, it } from "vitest";
import { resolveLocation, UnknownLocationError } from "../locationResolver";

describe("resolveLocation", () => {
  it("resolves a known location to its area code", () => {
    expect(resolveLocation("tokyo").areaCode).toBe("130000");
  });

  it("resolves tsukuba to Ibaraki's area code with the south sub-area and Tsukuba amedas station", () => {
    const tsukuba = resolveLocation("tsukuba");
    expect(tsukuba.areaCode).toBe("080000");
    expect(tsukuba.subAreaCode).toBe("080020");
    expect(tsukuba.amedasStationCode).toBe("40336");
  });

  it("resolves sapporo to the Ishikari/Sorachi/Shiribeshi forecast area code (016000, not the sub-area code 016010)", () => {
    // 北海道は複数の地方気象台に分かれており、予報APIには石狩・空知・後志地方=016000を渡す必要がある。
    // 016010は本来016000のレスポンス内areas配列に現れるsub-area codeであり、予報API自体のURLには使えない（404）。
    expect(resolveLocation("sapporo").areaCode).toBe("016000");
  });

  it("throws UnknownLocationError for an unregistered locationId", () => {
    expect(() => resolveLocation("nowhere")).toThrow(UnknownLocationError);
  });
});
