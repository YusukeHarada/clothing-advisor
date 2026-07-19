import { describe, expect, it } from "vitest";
import { computeRelativeAdvice } from "../relativeAdvice";

describe("computeRelativeAdvice", () => {
  it("suggests lighter clothing when today is notably warmer than the baseline", () => {
    const result = computeRelativeAdvice(20, 14);
    expect(result.direction).toBe("lighter");
    expect(result.message).toContain("暖かい");
  });

  it("suggests heavier clothing when today is notably colder than the baseline", () => {
    const result = computeRelativeAdvice(10, 16);
    expect(result.direction).toBe("heavier");
    expect(result.message).toContain("寒い");
  });

  it("gives no advice when the difference is within the threshold", () => {
    const result = computeRelativeAdvice(15, 14);
    expect(result.direction).toBe("none");
    expect(result.message).toBeNull();
  });
});
