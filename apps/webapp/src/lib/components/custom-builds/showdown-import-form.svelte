<script lang="ts">
  import ClipboardPasteIcon from "@lucide/svelte/icons/clipboard-paste";
  import SaveIcon from "@lucide/svelte/icons/save";
  import XIcon from "@lucide/svelte/icons/x";
  import { Badge } from "$lib/components/ui/badge";
  import { Button } from "$lib/components/ui/button";
  import { Label } from "$lib/components/ui/label";
  import { Textarea } from "$lib/components/ui/textarea";
  import { formatNature, formatStatPoints } from "$lib/speed-tiers";
  import { cn } from "$lib/utils";
  import UnsupportedModifiersNotice from "./unsupported-modifiers-notice.svelte";
  import type { CustomBuildImportPreview, CustomBuildImportState } from "./types";

  let {
    value = $bindable(""),
    state = { status: "idle" },
    disabled = false,
    class: className,
    onPreview,
    onSave,
    onClear,
  }: {
    value?: string;
    state?: CustomBuildImportState;
    disabled?: boolean;
    class?: string;
    onPreview: (showdownText: string) => void;
    onSave: (preview: CustomBuildImportPreview) => void;
    onClear?: () => void;
  } = $props();

  const canPreview = $derived(value.trim().length > 0 && !disabled);
  function preview() {
    if (!canPreview) {
      return;
    }

    onPreview(value);
  }
</script>

<div class={cn("grid gap-4", className)}>
  <div class="grid gap-2">
    <Label for="custom-build-showdown">Showdown set</Label>
    <Textarea
      id="custom-build-showdown"
      bind:value
      disabled={disabled}
      rows={8}
      placeholder={`Iron Bundle @ Choice Scarf
Ability: Quark Drive
EVs: 252 Spe
Timid Nature`}
      aria-describedby="custom-build-showdown-help"
      class="min-h-44"
    />
    <p id="custom-build-showdown-help" class="text-xs text-muted-foreground">
      Paste one set. Non-speed lines are ignored when the parser can resolve the
      Pokemon.
    </p>
  </div>

  <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
    {#if onClear}
      <Button type="button" variant="secondary" disabled={disabled} onclick={onClear}>
        <XIcon data-icon="inline-start" />
        Clear
      </Button>
    {/if}
    <Button type="button" disabled={!canPreview} onclick={preview}>
      <ClipboardPasteIcon data-icon="inline-start" />
      Preview import
    </Button>
  </div>

  {#if state.status === "error"}
    <section
      aria-live="polite"
      class="grid gap-2 rounded-2xl bg-destructive/10 p-4 text-sm text-destructive"
    >
      <h3 class="font-medium">Could not import this set</h3>
      <ul class="grid gap-1">
        {#each state.errors as error (`${error.code}-${error.rawText ?? error.message}`)}
          <li>{error.message}</li>
        {/each}
      </ul>
    </section>
  {:else if state.status === "parsed"}
    <section aria-live="polite" class="grid gap-4 rounded-2xl border border-border p-4">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div class="grid gap-1">
          <div class="flex flex-wrap items-center gap-2">
            <h3 class="font-medium">
              {state.preview.resolvedInput?.nickname ??
                state.preview.resolvedInput?.species.name ??
                state.preview.build.species.name}
            </h3>
            <Badge variant="secondary">Showdown</Badge>
          </div>
          <p class="text-sm text-muted-foreground">
            {state.preview.resolvedInput
              ? `${formatStatPoints(state.preview.resolvedInput.speedStatPoints)} / ${formatNature(state.preview.resolvedInput.nature)}`
              : "Waiting for species resolver"}
          </p>
        </div>

        <Button
          type="button"
          disabled={disabled || state.preview.resolvedInput === undefined}
          onclick={() => onSave(state.preview)}
        >
          <SaveIcon data-icon="inline-start" />
          Save build
        </Button>
      </div>

      {#if state.warnings.length > 0}
        <div class="grid gap-1 text-sm text-muted-foreground">
          {#each state.warnings as warning (`${warning.code}-${warning.rawText ?? warning.message}`)}
            <p>{warning.message}</p>
          {/each}
        </div>
      {/if}

      <UnsupportedModifiersNotice modifiers={state.preview.strippedModifiers} />
    </section>
  {/if}
</div>
