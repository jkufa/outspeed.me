import type { Snippet } from "svelte";

/** A selectable option rendered by MultiFilterCombobox. */
export type MultiFilterComboboxOption = {
  /** Stable value emitted in the bound value array. */
  value: string | number;
  /** Human-readable option text used in chips and default command content. */
  label: string;
  /** Prevents selecting this option from the default content and toggle helper. */
  disabled?: boolean;
};

/** Helpers and state passed to custom dropdown content snippets. */
export type MultiFilterComboboxContentContext = {
  /** Options passed to the component. */
  options: MultiFilterComboboxOption[];
  /** Current selected values. Empty array means all/no restriction for callers. */
  value: Array<string | number>;
  /** Returns whether an option value is currently selected. */
  isSelected: (optionValue: string | number) => boolean;
  /** Toggles an option value unless that option is disabled. */
  toggleOption: (optionValue: string | number) => void;
  /** Clears all selected values. */
  clear: () => void;
  /** Closes the popover. */
  close: () => void;
};

/** Props for MultiFilterCombobox. */
export type MultiFilterComboboxProps = {
  /** Options shown in the default command dropdown and exposed to custom content. */
  options: MultiFilterComboboxOption[];
  /** Selected option values. Bindable; empty array means all/no restriction for callers. */
  value: Array<string | number>;
  /** Trigger text when no values are selected. Defaults to "All". */
  placeholder?: string;
  /** Search input placeholder in the default command content. Defaults to "Search...". */
  searchPlaceholder?: string;
  /** Empty-state text in the default command content. Defaults to "No results found". */
  emptyText?: string;
  /** Disables the trigger. Defaults to false. */
  disabled?: boolean;
  /** Accessible trigger label. Defaults to a summary of selected filters. */
  ariaLabel?: string;
  /** Optional custom shadcn-based dropdown content. */
  content?: Snippet<[MultiFilterComboboxContentContext]>;
  /** Optional classes applied to the trigger button. */
  class?: string;
};
