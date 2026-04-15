<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Label } from "$lib/components/ui/label";
  import MultiFilterCombobox from "./multi-filter-combobox.svelte";
  import type { MultiFilterComboboxOption } from "./props";

  let {
    options,
    value = $bindable<Array<string | number>>([]),
    width = "18rem",
    customContent = false,
  }: {
    options: MultiFilterComboboxOption[];
    value?: Array<string | number>;
    width?: string;
    customContent?: boolean;
  } = $props();
</script>

<div class="flex flex-col gap-2" style:width>
  <Label>Filters</Label>
  {#if customContent}
    <MultiFilterCombobox bind:value {options} placeholder="All" ariaLabel="Filters">
      {#snippet content({ options, toggleOption, close })}
        <div class="flex flex-col gap-2 p-2">
          {#each options as option (option.value)}
            <Button
              variant="ghost"
              disabled={option.disabled}
              onclick={() => toggleOption(option.value)}
            >
              Custom {option.label}
            </Button>
          {/each}
          <Button variant="outline" onclick={close}>Close</Button>
        </div>
      {/snippet}
    </MultiFilterCombobox>
  {:else}
    <MultiFilterCombobox bind:value {options} placeholder="All" ariaLabel="Filters" />
  {/if}
  <output aria-label="Selected value">{JSON.stringify(value)}</output>
</div>
