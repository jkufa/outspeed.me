<script lang="ts">
  import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
  import ChevronUpIcon from "@lucide/svelte/icons/chevron-up";
  import XIcon from "@lucide/svelte/icons/x";
  import * as InputGroup from "$lib/components/ui/input-group";

  let {
    value = $bindable(""),
    disabled = false,
    hasMatches = false,
    matchCountLabel = null,
    onNext,
    onPrevious,
    onClear,
  }: {
    value?: string;
    disabled?: boolean;
    hasMatches?: boolean;
    matchCountLabel?: string | null;
    onNext: () => void;
    onPrevious: () => void;
    onClear: () => void;
  } = $props();

  const canNavigate = $derived(!disabled && hasMatches);
  const canClear = $derived(!disabled && value.trim() !== "");

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Enter") {
      event.preventDefault();

      if (event.shiftKey) {
        onPrevious();
        return;
      }

      onNext();
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      onNext();
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      onPrevious();
    }
  }

  function clearSearch() {
    value = "";
    onClear();
  }
</script>

<label class="grid gap-2 text-sm">
  <InputGroup.Root data-disabled={disabled || undefined}>
    <InputGroup.Input
      bind:value
      aria-label="Find Pokemon"
      placeholder="Search by name"
      {disabled}
      onkeydown={handleKeydown}
    />

    {#if matchCountLabel !== null}
      <InputGroup.Addon align="inline-end">
        <InputGroup.Text>{matchCountLabel}</InputGroup.Text>
      </InputGroup.Addon>
    {/if}

    <!-- <div class="border-e h-[65%] mx-1"></div> -->

    <InputGroup.Addon align="inline-end" class="gap-0">
      <InputGroup.Button
        size="icon-sm"
        aria-label="Previous match"
        disabled={!canNavigate}
        onclick={onPrevious}
      >
        <ChevronUpIcon />
      </InputGroup.Button>

      <InputGroup.Button
        size="icon-sm"
        aria-label="Next match"
        disabled={!canNavigate}
        onclick={onNext}
      >
        <ChevronDownIcon />
      </InputGroup.Button>

      <InputGroup.Button
        size="icon-sm"
        aria-label="Clear search"
        disabled={!canClear}
        onclick={clearSearch}
      >
        <XIcon />
      </InputGroup.Button>
    </InputGroup.Addon>
  </InputGroup.Root>
</label>
