<script lang="ts">
  import BoxIcon from "@lucide/svelte/icons/box";
  import { Button } from "$lib/components/ui/button";
  import * as Drawer from "$lib/components/ui/drawer";
  import type { CustomBuildInput, CustomBuildId, CustomBuildStored } from "$lib/custom-builds";
  import MyBuildsPanel from "./my-builds-panel.svelte";
  import type {
    CustomBuildDisplayBuild,
    CustomBuildImportPreview,
    CustomBuildImportState,
    CustomBuildModifierOption,
    CustomBuildSpeciesOption,
  } from "./types";

  let {
    open = $bindable(false),
    triggerLabel = "My builds",
    builds,
    editingBuild = null,
    speciesOptions,
    abilityOptions = [],
    itemOptions = [],
    importText = $bindable(""),
    importState = { status: "idle" },
    disabled = false,
    onCreateManual,
    onUpdateManual,
    onCancelEdit,
    onStartEdit,
    onDelete,
    onPreviewImport,
    onSaveImport,
    onClearImport,
  }: {
    open?: boolean;
    triggerLabel?: string;
    builds: CustomBuildDisplayBuild[];
    editingBuild?: CustomBuildStored | null;
    speciesOptions: CustomBuildSpeciesOption[];
    abilityOptions?: CustomBuildModifierOption[];
    itemOptions?: CustomBuildModifierOption[];
    importText?: string;
    importState?: CustomBuildImportState;
    disabled?: boolean;
    onCreateManual: (build: CustomBuildInput) => void;
    onUpdateManual: (id: CustomBuildId, build: CustomBuildInput) => void;
    onCancelEdit: () => void;
    onStartEdit: (build: CustomBuildDisplayBuild) => void;
    onDelete: (build: CustomBuildDisplayBuild) => void;
    onPreviewImport: (showdownText: string) => void;
    onSaveImport: (preview: CustomBuildImportPreview) => void;
    onClearImport?: () => void;
  } = $props();
</script>

<Drawer.Root bind:open>
  <Drawer.Trigger>
    {#snippet child({ props })}
      <Button
        {...props}
        type="button"
        variant="secondary"
        disabled={disabled || Boolean(props.disabled)}
        class="w-full sm:w-auto"
      >
        <BoxIcon data-icon="inline-start" />
        {triggerLabel} ({builds.length})
      </Button>
    {/snippet}
  </Drawer.Trigger>
  <Drawer.Content>
    <div class="mx-auto max-h-[85vh] w-full max-w-3xl overflow-y-auto px-2 pb-4">
      <Drawer.Header class="text-left">
        <Drawer.Title>My builds</Drawer.Title>
        <Drawer.Description>
          Manage custom builds saved on this device.
        </Drawer.Description>
      </Drawer.Header>

      <MyBuildsPanel
        {builds}
        {editingBuild}
        {speciesOptions}
        {abilityOptions}
        {itemOptions}
        bind:importText
        {importState}
        {disabled}
        onCreateManual={onCreateManual}
        onUpdateManual={onUpdateManual}
        onCancelEdit={onCancelEdit}
        onStartEdit={onStartEdit}
        onDelete={onDelete}
        onPreviewImport={onPreviewImport}
        onSaveImport={onSaveImport}
        onClearImport={onClearImport}
        class="ring-0"
      />
    </div>
  </Drawer.Content>
</Drawer.Root>
