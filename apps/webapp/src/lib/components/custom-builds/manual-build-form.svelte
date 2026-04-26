<script lang="ts">
  import { Label } from "$lib/components/ui/label";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import * as InputGroup from "$lib/components/ui/input-group";
  import * as Select from "$lib/components/ui/select";
  import type { CustomBuildInput, CustomBuildOrigin } from "$lib/custom-builds";
  import type { Nature } from "$lib/speed-tiers";
  import { cn } from "$lib/utils";
  import type {
    CustomBuildFormValue,
    CustomBuildModifierOption,
    CustomBuildSpeciesOption,
    NatureOption,
  } from "./types";

  const natureOptions: NatureOption[] = [
    {
      value: "positive",
      label: "+Speed",
      description: "Speed-boosting nature",
    },
    {
      value: "neutral",
      label: "Neutral",
      description: "No nature change",
    },
    {
      value: "negative",
      label: "-Speed",
      description: "Speed-lowering nature",
    },
  ];
  const noModifierValue = "__none__";

  let {
    value = null,
    speciesOptions,
    abilityOptions = [],
    itemOptions = [],
    disabled = false,
    submitLabel = "Save build",
    cancelLabel = "Cancel",
    origin = "manual",
    class: className,
    onSubmit,
    onCancel,
  }: {
    value?: CustomBuildFormValue | null;
    speciesOptions: CustomBuildSpeciesOption[];
    abilityOptions?: CustomBuildModifierOption[];
    itemOptions?: CustomBuildModifierOption[];
    disabled?: boolean;
    submitLabel?: string;
    cancelLabel?: string;
    origin?: CustomBuildOrigin;
    class?: string;
    onSubmit: (build: CustomBuildInput) => void;
    onCancel?: () => void;
  } = $props();

  let nickname = $state("");
  let speciesSlug = $state("");
  let speedStatPointsText = $state("32");
  let nature = $state<Nature>("positive");
  let abilitySource = $state(noModifierValue);
  let itemSource = $state(noModifierValue);
  let formError = $state<string | null>(null);
  let seededValueKey = $state("");

  const selectedSpecies = $derived(
    speciesOptions.find((option) => option.slug === speciesSlug) ?? null,
  );
  const selectedAbility = $derived(
    abilityOptions.find((option) => option.source === abilitySource) ?? null,
  );
  const selectedItem = $derived(
    itemOptions.find((option) => option.source === itemSource) ?? null,
  );
  const selectedNature = $derived(
    natureOptions.find((option) => option.value === nature) ?? natureOptions[1],
  );

  function readModifier(
    option: CustomBuildModifierOption | null,
  ): CustomBuildInput["ability"] {
    if (option === null) {
      return null;
    }

    return {
      kind: option.kind,
      source: option.source,
      label: option.label,
    };
  }

  function seedForm(nextValue: CustomBuildFormValue | null) {
    nickname = nextValue?.nickname ?? "";
    speciesSlug = nextValue?.species.slug ?? speciesOptions[0]?.slug ?? "";
    speedStatPointsText = String(nextValue?.speedStatPoints ?? 32);
    nature = nextValue?.nature ?? "positive";
    abilitySource = nextValue?.ability?.source ?? noModifierValue;
    itemSource = nextValue?.item?.source ?? noModifierValue;
    formError = null;
  }

  function valueKey(nextValue: CustomBuildFormValue | null) {
    if (nextValue && "id" in nextValue) {
      return nextValue.id;
    }

    return [
      nextValue?.species.slug ?? speciesOptions[0]?.slug ?? "",
      nextValue?.speedStatPoints ?? 32,
      nextValue?.nature ?? "positive",
      nextValue?.ability?.source ?? noModifierValue,
      nextValue?.item?.source ?? noModifierValue,
    ].join("|");
  }

  $effect(() => {
    const nextKey = valueKey(value);
    if (nextKey !== seededValueKey) {
      seededValueKey = nextKey;
      seedForm(value);
    }
  });

  function submit() {
    formError = null;

    if (selectedSpecies === null) {
      formError = "Choose a Pokemon before saving.";
      return;
    }

    const speedStatPoints = Number(speedStatPointsText);
    if (!Number.isInteger(speedStatPoints) || speedStatPoints < 0 || speedStatPoints > 32) {
      formError = "Enter a whole-number SP value from 0 to 32.";
      return;
    }

    onSubmit({
      species: {
        id: selectedSpecies.id,
        slug: selectedSpecies.slug,
        pokedexNo: selectedSpecies.pokedexNo,
        name: selectedSpecies.name,
      },
      nature,
      speedStatPoints,
      ability: readModifier(selectedAbility),
      item: readModifier(selectedItem),
      nickname: nickname.trim() === "" ? undefined : nickname.trim(),
      origin,
    });
  }
</script>

<form
  class={cn("grid gap-4", className)}
  onsubmit={(event) => {
    event.preventDefault();
    submit();
  }}
>
  <div class="grid gap-2">
    <Label for="custom-build-nickname">Build name</Label>
    <Input
      id="custom-build-nickname"
      bind:value={nickname}
      placeholder="Optional nickname"
      disabled={disabled}
    />
  </div>

  <div class="grid gap-2">
    <Label for="custom-build-species">Pokemon</Label>
    <Select.Root type="single" bind:value={speciesSlug} disabled={disabled}>
      <Select.Trigger id="custom-build-species" class="w-full">
        {selectedSpecies?.name ?? "Choose Pokemon"}
      </Select.Trigger>
      <Select.Content class="max-h-72">
        <Select.Group>
          {#each speciesOptions as option (option.slug)}
            <Select.Item
              value={option.slug}
              label={option.name}
              disabled={option.disabled}
            >
              <span class="truncate">{option.name}</span>
            </Select.Item>
          {/each}
        </Select.Group>
      </Select.Content>
    </Select.Root>
  </div>

  <div class="grid gap-4 sm:grid-cols-2">
    <div class="grid gap-2">
      <Label for="custom-build-sp">Speed SP</Label>
      <InputGroup.Root>
        <InputGroup.Input
          id="custom-build-sp"
          type="number"
          inputmode="numeric"
          min="0"
          max="32"
          step="1"
          bind:value={speedStatPointsText}
          disabled={disabled}
          aria-describedby="custom-build-sp-help"
        />
        <InputGroup.Addon align="inline-end">SP</InputGroup.Addon>
      </InputGroup.Root>
      <p id="custom-build-sp-help" class="text-xs text-muted-foreground">
        Champions investment, for example 0 SP or 32 SP.
      </p>
    </div>

    <div class="grid gap-2">
      <Label for="custom-build-nature">Nature</Label>
      <Select.Root type="single" bind:value={nature} disabled={disabled}>
        <Select.Trigger id="custom-build-nature" class="w-full">
          {selectedNature?.label}
        </Select.Trigger>
        <Select.Content>
          <Select.Group>
            {#each natureOptions as option (option.value)}
              <Select.Item value={option.value} label={option.label}>
                <span class="grid">
                  <span>{option.label}</span>
                  <span class="text-xs text-muted-foreground">{option.description}</span>
                </span>
              </Select.Item>
            {/each}
          </Select.Group>
        </Select.Content>
      </Select.Root>
    </div>
  </div>

  <div class="grid gap-4 sm:grid-cols-2">
    <div class="grid gap-2">
      <Label for="custom-build-item">Speed item</Label>
      <Select.Root type="single" bind:value={itemSource} disabled={disabled}>
        <Select.Trigger id="custom-build-item" class="w-full">
          {selectedItem?.label ?? "No item"}
        </Select.Trigger>
        <Select.Content>
          <Select.Group>
            <Select.Item value={noModifierValue} label="No item">No item</Select.Item>
            {#each itemOptions as option (option.source)}
              <Select.Item
                value={option.source}
                label={option.label}
                disabled={option.disabled}
              >
                <span class="grid">
                  <span>{option.label}</span>
                  {#if option.description}
                    <span class="text-xs text-muted-foreground">{option.description}</span>
                  {/if}
                </span>
              </Select.Item>
            {/each}
          </Select.Group>
        </Select.Content>
      </Select.Root>
    </div>

    <div class="grid gap-2">
      <Label for="custom-build-ability">Speed ability</Label>
      <Select.Root type="single" bind:value={abilitySource} disabled={disabled}>
        <Select.Trigger id="custom-build-ability" class="w-full">
          {selectedAbility?.label ?? "No ability"}
        </Select.Trigger>
        <Select.Content>
          <Select.Group>
            <Select.Item value={noModifierValue} label="No ability">No ability</Select.Item>
            {#each abilityOptions as option (option.source)}
              <Select.Item
                value={option.source}
                label={option.label}
                disabled={option.disabled}
              >
                <span class="grid">
                  <span>{option.label}</span>
                  {#if option.description}
                    <span class="text-xs text-muted-foreground">{option.description}</span>
                  {/if}
                </span>
              </Select.Item>
            {/each}
          </Select.Group>
        </Select.Content>
      </Select.Root>
    </div>
  </div>

  {#if formError}
    <p class="rounded-2xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
      {formError}
    </p>
  {/if}

  <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
    {#if onCancel}
      <Button
        type="button"
        variant="secondary"
        disabled={disabled}
        onclick={onCancel}
        class="w-full sm:w-auto"
      >
        {cancelLabel}
      </Button>
    {/if}
    <Button
      type="submit"
      disabled={disabled || speciesOptions.length === 0}
      class="w-full sm:w-auto"
    >
      {submitLabel}
    </Button>
  </div>
</form>
