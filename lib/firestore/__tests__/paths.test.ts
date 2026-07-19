import { describe, expect, it } from "vitest";
import { paths } from "../paths";

describe("paths", () => {
  it("builds a location document path", () => {
    expect(paths.location("tokyo")).toBe("locations/tokyo");
  });

  it("builds a user settings document path", () => {
    expect(paths.userSettings("uid123")).toBe("users/uid123/settings/default");
  });

  it("builds weather history document and collection paths", () => {
    expect(paths.weatherHistoryDoc("tokyo", "2026-07-19")).toBe(
      "weather_history/tokyo/history/2026-07-19"
    );
    expect(paths.weatherHistoryCollection("tokyo")).toBe("weather_history/tokyo/history");
  });

  it("builds a changeover state document path scoped to uid and locationId", () => {
    expect(paths.changeoverState("uid123", "tokyo")).toBe(
      "users/uid123/locations/tokyo/changeover_state/current"
    );
  });
});
