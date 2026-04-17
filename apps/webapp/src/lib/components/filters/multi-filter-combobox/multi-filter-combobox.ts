export type ChipCollapseInput = {
  availableWidth: number;
  chipWidths: number[];
  overflowBadgeWidth: number;
  gapWidth: number;
};

export function calculateVisibleChipCount({
  availableWidth,
  chipWidths,
  overflowBadgeWidth,
  gapWidth,
}: ChipCollapseInput) {
  if (availableWidth <= 0 || chipWidths.length === 0) {
    return 0;
  }

  let usedWidth = 0;

  for (let index = 0; index < chipWidths.length; index += 1) {
    const visibleGapWidth = index === 0 ? 0 : gapWidth;
    const remainingChips = chipWidths.length - index - 1;
    const overflowWidth = remainingChips > 0 ? gapWidth + overflowBadgeWidth : 0;
    const nextWidth = visibleGapWidth + chipWidths[index];

    if (usedWidth + nextWidth + overflowWidth > availableWidth) {
      return index;
    }

    usedWidth += nextWidth;
  }

  return chipWidths.length;
}

export function optionValuesEqual(left: string | number, right: string | number) {
  return left === right;
}
