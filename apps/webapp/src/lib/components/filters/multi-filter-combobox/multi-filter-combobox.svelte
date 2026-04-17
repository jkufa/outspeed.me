<script lang="ts">
  import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
  import XIcon from "@lucide/svelte/icons/x";
  import { onMount, tick } from "svelte";
  import { Badge } from "$lib/components/ui/badge";
  import { Button } from "$lib/components/ui/button";
  import * as Command from "$lib/components/ui/command";
  import * as Popover from "$lib/components/ui/popover";
  import { cn } from "$lib/utils";
  import {
    calculateVisibleChipCount,
    optionValuesEqual,
  } from "./multi-filter-combobox";
  import type { MultiFilterComboboxProps } from "./props";

  let {
    options,
    value = $bindable<Array<string | number>>([]),
    maxVisibleChips = 2,
    placeholder = "All",
    searchPlaceholder = "Search...",
    emptyText = "No results found",
    disabled = false,
    ariaLabel,
    clearAriaLabel = "Clear selected filters",
    content,
    class: className,
  }: MultiFilterComboboxProps = $props();

  let open = $state(false);
  let valueAreaRef = $state<HTMLElement | null>(null);
  let measurementRef = $state<HTMLElement | null>(null);
  let visibleChipCount = $state(0);

  const selectedOptions = $derived(
    value
      .map((selectedValue) =>
        options.find((option) =>
          optionValuesEqual(option.value, selectedValue),
        ),
      )
      .filter((option) => option !== undefined),
  );
  const visibleOptions = $derived(selectedOptions.slice(0, visibleChipCount));
  const hiddenChipCount = $derived(
    Math.max(0, selectedOptions.length - visibleOptions.length),
  );
  const canClear = $derived(!disabled && selectedOptions.length > 0);
  const triggerLabel = $derived(
    selectedOptions.length === 0
      ? placeholder
      : selectedOptions.map((option) => option.label).join(", "),
  );
  const triggerAriaLabel = $derived(
    ariaLabel ?? `Selected filters: ${triggerLabel}`,
  );

  function isSelected(optionValue: string | number) {
    return value.some((selectedValue) =>
      optionValuesEqual(selectedValue, optionValue),
    );
  }

  function toggleOption(optionValue: string | number) {
    const option = options.find((item) =>
      optionValuesEqual(item.value, optionValue),
    );

    if (option?.disabled) {
      return;
    }

    if (isSelected(optionValue)) {
      value = value.filter(
        (selectedValue) => !optionValuesEqual(selectedValue, optionValue),
      );
      return;
    }

    value = [...value, optionValue];
  }

  function clear() {
    value = [];
  }

  function close() {
    open = false;
  }

  function handleClearClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    clear();
  }

  async function updateVisibleChipCount(
    selectedOptionCount = selectedOptions.length,
  ) {
    await tick();

    if (
      selectedOptionCount === 0 ||
      valueAreaRef === null ||
      measurementRef === null
    ) {
      visibleChipCount = 0;
      return;
    }

    if (selectedOptionCount <= maxVisibleChips) {
      visibleChipCount = selectedOptionCount;
      return;
    }

    const chipMeasureElements = Array.from(
      measurementRef.querySelectorAll<HTMLElement>("[data-measure-chip]"),
    );
    const overflowBadgeElement = measurementRef.querySelector<HTMLElement>(
      "[data-measure-overflow]",
    );
    const valueAreaWidth =
      valueAreaRef.getBoundingClientRect().width || valueAreaRef.clientWidth;
    const triggerWidth =
      valueAreaRef.closest("button")?.getBoundingClientRect().width ??
      valueAreaWidth;
    const availableWidth =
      valueAreaWidth > 0 ? valueAreaWidth : Math.max(0, triggerWidth - 40);
    const chipWidths = chipMeasureElements
      .slice(0, selectedOptionCount)
      .map((chip) => chip.getBoundingClientRect().width);

    if (availableWidth === 0 || chipWidths.every((width) => width === 0)) {
      visibleChipCount = Math.min(selectedOptionCount, maxVisibleChips);
      return;
    }

    visibleChipCount = Math.min(
      maxVisibleChips,
      calculateVisibleChipCount({
        availableWidth,
        chipWidths,
        overflowBadgeWidth:
          overflowBadgeElement?.getBoundingClientRect().width ?? 0,
        gapWidth: 4,
      }),
    );
  }

  $effect(() => {
    const selectedOptionCount = selectedOptions.length;
    const canMeasure =
      valueAreaRef !== null &&
      (measurementRef !== null || selectedOptionCount === 0);

    if (canMeasure) {
      updateVisibleChipCount(selectedOptionCount);
    }
  });

  onMount(() => {
    updateVisibleChipCount();

    if (valueAreaRef === null || typeof ResizeObserver === "undefined") {
      return;
    }

    const resizeObserver = new ResizeObserver(() => {
      updateVisibleChipCount();
    });

    resizeObserver.observe(valueAreaRef);

    return () => resizeObserver.disconnect();
  });
</script>

<Popover.Root bind:open>
  <div class="relative">
    <Popover.Trigger>
      {#snippet child({ props })}
        <Button
          {...props}
          type="button"
          variant="outline"
          disabled={disabled || Boolean(props.disabled)}
          aria-label={triggerAriaLabel}
          aria-expanded={open}
          class={cn(
            "w-full min-w-0 max-w-full shrink justify-between overflow-hidden px-2",
            className,
          )}
        >
          <span
            bind:this={valueAreaRef}
            class="flex w-full min-w-0 max-w-full flex-1 items-center gap-1 overflow-hidden"
          >
            {#if selectedOptions.length === 0}
              <span class="truncate text-muted-foreground px-2"
                >{placeholder}</span
              >
            {:else}
              {#each visibleOptions as option (option.value)}
                <Badge variant="secondary" class="max-w-28 shrink-0">
                  <span class="truncate">{option.label}</span>
                </Badge>
              {/each}

              {#if hiddenChipCount > 0}
                <Badge variant="secondary" class="shrink-0"
                  >+{hiddenChipCount}</Badge
                >
              {/if}
            {/if}
          </span>
          {#if canClear}
            <span aria-hidden="true" class="size-6 shrink-0"></span>
          {/if}
          <ChevronDownIcon data-icon="inline-end" class="text-muted-foreground" />
        </Button>
      {/snippet}
    </Popover.Trigger>

    {#if canClear}
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        aria-label={clearAriaLabel}
        class="absolute top-1/2 right-[1.875rem] z-10 -translate-y-1/2 text-muted-foreground hover:text-foreground active:translate-y-0"
        onclick={handleClearClick}
      >
        <XIcon />
      </Button>
    {/if}
  </div>

  <Popover.Content align="start" class="w-(--bits-popover-anchor-width) p-0">
    {#if content}
      {@render content({
        options,
        value,
        isSelected,
        toggleOption,
        clear,
        close,
      })}
    {:else}
      <Command.Root>
        <Command.Input placeholder={searchPlaceholder} />
        <Command.List>
          <Command.Empty>{emptyText}</Command.Empty>
          <Command.Group>
            {#each options as option (option.value)}
              <Command.Item
                value={option.label}
                disabled={option.disabled}
                data-checked={isSelected(option.value)}
                onSelect={() => toggleOption(option.value)}
              >
                {option.label}
              </Command.Item>
            {/each}
          </Command.Group>
        </Command.List>
      </Command.Root>
    {/if}
  </Popover.Content>
</Popover.Root>

{#if selectedOptions.length > 0}
  <div
    bind:this={measurementRef}
    aria-hidden="true"
    class="pointer-events-none absolute -z-10 flex h-0 gap-1 overflow-hidden opacity-0"
  >
    {#each selectedOptions as option (option.value)}
      <Badge data-measure-chip variant="secondary" class="max-w-28 shrink-0">
        <span class="truncate">{option.label}</span>
      </Badge>
    {/each}
    <Badge data-measure-overflow variant="secondary" class="shrink-0">
      +{selectedOptions.length}
    </Badge>
  </div>
{/if}
