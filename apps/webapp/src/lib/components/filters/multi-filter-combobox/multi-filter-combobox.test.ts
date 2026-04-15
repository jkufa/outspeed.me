import { describe, expect, it } from "vitest";
import { calculateVisibleChipCount } from "./multi-filter-combobox";

describe("calculateVisibleChipCount", () => {
  it("shows every chip when they fit", () => {
    expect(
      calculateVisibleChipCount({
        availableWidth: 200,
        chipWidths: [40, 50, 60],
        overflowBadgeWidth: 32,
        gapWidth: 4,
      }),
    ).toBe(3);
  });

  it("reserves space for an overflow badge", () => {
    expect(
      calculateVisibleChipCount({
        availableWidth: 130,
        chipWidths: [40, 50, 60],
        overflowBadgeWidth: 32,
        gapWidth: 4,
      }),
    ).toBe(2);
  });

  it("shows only the count badge when no chip fits beside it", () => {
    expect(
      calculateVisibleChipCount({
        availableWidth: 36,
        chipWidths: [40, 50, 60],
        overflowBadgeWidth: 32,
        gapWidth: 4,
      }),
    ).toBe(0);
  });
});
