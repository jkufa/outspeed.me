<script lang="ts">
  import PencilIcon from "@lucide/svelte/icons/pencil";
  import Trash2Icon from "@lucide/svelte/icons/trash-2";
  import { Badge } from "$lib/components/ui/badge";
  import { Button, buttonVariants } from "$lib/components/ui/button";
  import * as Dialog from "$lib/components/ui/dialog";
  import { Separator } from "$lib/components/ui/separator";
  import { formatNature, formatStatPoints } from "$lib/speed-tiers";
  import { cn } from "$lib/utils";
  import UnsupportedModifiersNotice from "./unsupported-modifiers-notice.svelte";
  import type { CustomBuildDisplayBuild } from "./types";

  let {
    builds,
    disabled = false,
    class: className,
    onEdit,
    onDelete,
  }: {
    builds: CustomBuildDisplayBuild[];
    disabled?: boolean;
    class?: string;
    onEdit: (build: CustomBuildDisplayBuild) => void;
    onDelete: (build: CustomBuildDisplayBuild) => void;
  } = $props();

  let deleteTarget = $state<CustomBuildDisplayBuild | null>(null);

  function formatUpdatedAt(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function modifierLabel(build: CustomBuildDisplayBuild) {
    const labels = [build.item?.label, build.ability?.label].filter(
      (label) => label !== undefined && label !== "",
    );
    return labels.length === 0 ? "No speed item or ability" : labels.join(" / ");
  }

  function confirmDelete() {
    if (deleteTarget === null) {
      return;
    }

    onDelete(deleteTarget);
    deleteTarget = null;
  }
</script>

<div class={cn("grid gap-3", className)}>
  {#if builds.length === 0}
    <section class="grid gap-2 rounded-2xl border border-dashed border-border p-6 text-center">
      <h3 class="font-medium">No custom builds yet</h3>
      <p class="text-sm text-muted-foreground">
        Add a manual build or paste a Showdown set. Saved builds stay on this
        device.
      </p>
    </section>
  {:else}
    <ul class="grid gap-3">
      {#each builds as build (build.id)}
        <li class="rounded-2xl border border-border bg-card p-4">
          <article class="grid gap-4">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <h3 class="truncate font-medium">
                    {build.nickname ?? build.species.name}
                  </h3>
                  <Badge variant="secondary">My build</Badge>
                  <Badge variant="outline">{build.origin}</Badge>
                </div>
                <p class="mt-1 text-sm text-muted-foreground">
                  {build.species.name} / {formatStatPoints(build.speedStatPoints)}
                  / {formatNature(build.nature)}
                </p>
                <p class="mt-1 text-xs text-muted-foreground">
                  {modifierLabel(build)}
                </p>
              </div>

              <div class="flex shrink-0 gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={disabled}
                  onclick={() => onEdit(build)}
                >
                  <PencilIcon data-icon="inline-start" />
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={disabled}
                  onclick={() => (deleteTarget = build)}
                >
                  <Trash2Icon data-icon="inline-start" />
                  Delete
                </Button>
              </div>
            </div>

            <Separator />

            <div class="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
              <span>Saved on this device</span>
              <span>Updated {formatUpdatedAt(build.updatedAt)}</span>
              {#if build.finalSpeed !== undefined}
                <span>Final speed {build.finalSpeed}</span>
              {:else if build.rawSpeed !== undefined}
                <span>Raw speed {build.rawSpeed}</span>
              {/if}
            </div>

            {#if build.strippedModifiers && build.strippedModifiers.length > 0}
              <UnsupportedModifiersNotice modifiers={build.strippedModifiers} />
            {/if}
          </article>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<Dialog.Root open={deleteTarget !== null} onOpenChange={(open) => !open && (deleteTarget = null)}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Delete build?</Dialog.Title>
      <Dialog.Description>
        This removes {deleteTarget?.nickname ?? deleteTarget?.species.name ?? "this build"}
        from builds saved on this device.
      </Dialog.Description>
    </Dialog.Header>
    <Dialog.Footer>
      <Dialog.Close class={buttonVariants({ variant: "ghost" })}>
        Keep build
      </Dialog.Close>
      <Button type="button" variant="destructive" onclick={confirmDelete}>
        Delete build
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
