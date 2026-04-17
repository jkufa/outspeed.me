<script lang="ts">
  import { MultiFilterCombobox } from "$lib/components/filters/multi-filter-combobox";
  import * as Command from "$lib/components/ui/command";
  import type { ItemFilter } from "$lib/speed-tiers";
  import {
    itemFilterAriaLabel,
    itemFilterOptions,
  } from "./item-filter-options";
  import favicon from "$lib/assets/favicon.png";

  let {
    value = $bindable<ItemFilter[]>([]),
    disabled = false,
  }: {
    value?: ItemFilter[];
    disabled?: boolean;
  } = $props();
</script>

<MultiFilterCombobox
  bind:value
  options={itemFilterOptions}
  {disabled}
  placeholder="Items"
  emptyText="No items found"
  ariaLabel={itemFilterAriaLabel(value)}
  clearAriaLabel="Clear item filter"
  class="rounded-full"
>
  {#snippet content({ options, isSelected, toggleOption })}
    <Command.Root>
      <Command.List>
        <Command.Empty>No items found</Command.Empty>
        <Command.Group>
          {#each options as option (option.value)}
            <Command.Item
              value={option.label}
              data-checked={isSelected(option.value)}
              onSelect={() => toggleOption(option.value)}
            >
              <!-- TODO: Right now scarf is the only item. We have to add infra for item images in the future -->
              <img src={favicon} alt={option.label} class="size-6" />
              {option.label}
            </Command.Item>
          {/each}
        </Command.Group>
      </Command.List>
    </Command.Root>
  {/snippet}
</MultiFilterCombobox>
