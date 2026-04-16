<script lang="ts">
  import { MultiFilterCombobox } from "$lib/components/filters/multi-filter-combobox";
  import FilterAllOption from "$lib/components/filters/filter-all-option.svelte";
  import * as Command from "$lib/components/ui/command";
  import {
    pokemonFilterAriaLabel,
    type PokemonFilterOption,
  } from "./pokemon-filter-options";
  import PokemonCommandItemRow from "./pokemon-command-item-row.svelte";

  let {
    value = $bindable<number[]>([]),
    options,
    disabled = false,
  }: {
    value?: number[];
    options: PokemonFilterOption[];
    disabled?: boolean;
  } = $props();
</script>

<MultiFilterCombobox
  bind:value
  {options}
  {disabled}
  placeholder="All species"
  searchPlaceholder="Search Pokemon..."
  emptyText="No Pokemon found"
  ariaLabel={pokemonFilterAriaLabel(value, options)}
  clearAriaLabel="Clear Pokemon filter"
>
  {#snippet content({ options: commandOptions, value: selected, isSelected, toggleOption, clear })}
    <Command.Root>
      <Command.Input placeholder="Search Pokemon..." />
      <Command.List>
        <Command.Empty>No Pokemon found</Command.Empty>

        <Command.Group>
          <FilterAllOption checked={selected.length === 0} onSelect={clear} />
        </Command.Group>
        <Command.Separator />

        <Command.Group>
          {#each commandOptions as option (option.value)}
            <Command.Item
              value={option.label}
              disabled={option.disabled}
              data-checked={isSelected(option.value)}
              onSelect={() => toggleOption(option.value)}
            >
              <PokemonCommandItemRow
                name={option.label}
                sprite={(option as PokemonFilterOption).sprite}
              />
            </Command.Item>
          {/each}
        </Command.Group>
      </Command.List>
    </Command.Root>
  {/snippet}
</MultiFilterCombobox>
