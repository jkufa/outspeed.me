<script lang="ts">
  import { MultiFilterCombobox } from "$lib/components/filters/multi-filter-combobox";
  import FilterAllOption from "$lib/components/filters/filter-all-option.svelte";
  import * as Command from "$lib/components/ui/command";
  import type { SpreadFilterKey } from "$lib/speed-tiers";
  import {
    spreadFilterAriaLabel,
    spreadFilterOptions,
    spreadFilterParts,
  } from "./spread-filter-options";

  let {
    value = $bindable<SpreadFilterKey[]>([]),
    disabled = false,
  }: {
    value?: SpreadFilterKey[];
    disabled?: boolean;
  } = $props();
</script>

<MultiFilterCombobox
  bind:value
  {disabled}
  placeholder="All spreads"
  searchPlaceholder="Search spreads..."
  emptyText="No spreads found"
  ariaLabel={spreadFilterAriaLabel(value)}
  options={spreadFilterOptions}
  class="rounded-full text-xs"
>
  {#snippet content({
    options,
    value: selected,
    isSelected,
    toggleOption,
    clear,
  })}
    <Command.Root>
      <Command.Input placeholder="Search spreads..." />
      <Command.List>
        <Command.Empty>No spreads found</Command.Empty>

        <Command.Group>
          <FilterAllOption checked={selected.length === 0} onSelect={clear} />
        </Command.Group>
        <Command.Separator />

        <Command.Group>
          {#each options as option (option.value)}
            {@const parts = spreadFilterParts[option.value as SpreadFilterKey]}
            <Command.Item
              class="font-mono text-xs tabular-nums"
              value={option.label}
              data-checked={isSelected(option.value)}
              onSelect={() => toggleOption(option.value)}
            >
              <span
                class="flex min-w-0 max-w-24 flex-1 items-center justify-between gap-4 pr-1"
              >
                <span class="shrink-0 text-end">{parts.nature}</span>
                <span class="text-end">{parts.points}</span>
              </span>
            </Command.Item>
          {/each}
        </Command.Group>
      </Command.List>
    </Command.Root>
  {/snippet}
</MultiFilterCombobox>
