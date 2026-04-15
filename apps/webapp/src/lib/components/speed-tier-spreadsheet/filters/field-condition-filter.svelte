<script lang="ts">
  import { MultiFilterCombobox } from "$lib/components/filters/multi-filter-combobox";
  import FilterAllOption from "$lib/components/filters/filter-all-option.svelte";
  import * as Command from "$lib/components/ui/command";
  import type { FieldConditionFilter } from "$lib/speed-tiers";
  import {
    fieldConditionAriaLabel,
    fieldConditionByGroup,
    fieldConditionFilterOptions,
  } from "./field-condition-filter-options";

  let {
    value = $bindable<FieldConditionFilter[]>([]),
    disabled = false,
  }: {
    value?: FieldConditionFilter[];
    disabled?: boolean;
  } = $props();
</script>

<MultiFilterCombobox
  bind:value
  {disabled}
  placeholder="All"
  searchPlaceholder="Search field conditions..."
  emptyText="No field conditions found"
  ariaLabel={fieldConditionAriaLabel(value)}
  options={fieldConditionFilterOptions}
>
  {#snippet content({ options, value, isSelected, toggleOption, clear })}
    <Command.Root>
      <Command.Input placeholder="Search field conditions..." />
      <Command.List>
        <Command.Empty>No field conditions found</Command.Empty>

        <Command.Group>
          <FilterAllOption checked={value.length === 0} onSelect={clear} />
        </Command.Group>
        <Command.Separator />

        {#each Object.entries(fieldConditionByGroup) as [group, options]}
          <Command.Group
            heading={group.charAt(0).toUpperCase() + group.slice(1)}
          >
            {#each options as option (option.value)}
              <Command.Item
                value={option.label}
                data-checked={isSelected(option.value)}
                onSelect={() => toggleOption(option.value)}
              >
                {option.label}
              </Command.Item>
            {/each}
          </Command.Group>
        {/each}
      </Command.List>
    </Command.Root>
  {/snippet}
</MultiFilterCombobox>
