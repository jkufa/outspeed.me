<script lang="ts">
  import AlertTriangleIcon from "@lucide/svelte/icons/alert-triangle";
  import { Badge } from "$lib/components/ui/badge";
  import { Separator } from "$lib/components/ui/separator";
  import type { UnsupportedSpeedModifier } from "$lib/custom-builds";

  let {
    modifiers,
    title = "Unsupported speed effects ignored",
  }: {
    modifiers: UnsupportedSpeedModifier[];
    title?: string;
  } = $props();
</script>

{#if modifiers.length > 0}
  <section
    aria-live="polite"
    class="grid gap-3 rounded-2xl border border-border bg-muted/40 p-4 text-sm"
  >
    <div class="flex items-start gap-2">
      <AlertTriangleIcon data-icon="inline-start" class="mt-0.5 text-muted-foreground" />
      <div class="grid gap-1">
        <h3 class="font-medium">{title}</h3>
        <p class="text-muted-foreground">
          The saved speed uses only supported effects. These Showdown modifiers
          were stripped from the calculation.
        </p>
      </div>
    </div>

    <Separator />

    <ul class="grid gap-2">
      {#each modifiers as modifier, index (`${modifier.kind}-${modifier.source}-${index}`)}
        <li class="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{modifier.kind}</Badge>
          <span class="font-medium">{modifier.label ?? modifier.source}</span>
          <span class="text-muted-foreground">({modifier.reason})</span>
        </li>
      {/each}
    </ul>
  </section>
{/if}
