import type { SortingState } from "@tanstack/table-core";

export type SpeedSortDirection = false | "asc" | "desc";

export const defaultSpeedTierSorting: SortingState = [{ id: "speed", desc: true }];

export function currentSpeedSort(sorting: SortingState): SpeedSortDirection {
  const sort = sorting.find((entry) => entry.id === "speed");
  if (sort === undefined) return false;
  return sort.desc ? "desc" : "asc";
}

export function speedSortLabel(direction: SpeedSortDirection) {
  if (direction === "asc") return "Speed sorted ascending";
  return "Speed sorted descending";
}

export function sortDirectionLabel(direction: SpeedSortDirection) {
  if (direction === "asc") return "ascending";
  if (direction === "desc") return "descending";
  return undefined;
}

export function toggleSpeedSorting(sorting: SortingState): SortingState {
  const speedSort = currentSpeedSort(sorting);

  if (speedSort === "desc") {
    return [{ id: "speed", desc: false }];
  }

  return [{ id: "speed", desc: true }];
}
