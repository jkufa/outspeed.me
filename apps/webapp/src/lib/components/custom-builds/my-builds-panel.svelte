<script lang="ts">
  import DeviceMobileIcon from "@lucide/svelte/icons/smartphone";
  import { Badge } from "$lib/components/ui/badge";
  import * as Card from "$lib/components/ui/card";
  import * as Tabs from "$lib/components/ui/tabs";
  import type { CustomBuildInput, CustomBuildId, CustomBuildStored } from "$lib/custom-builds";
  import { cn } from "$lib/utils";
  import ManualBuildForm from "./manual-build-form.svelte";
  import SavedBuildsList from "./saved-builds-list.svelte";
  import ShowdownImportForm from "./showdown-import-form.svelte";
  import type {
    CustomBuildDisplayBuild,
    CustomBuildImportPreview,
    CustomBuildImportState,
    CustomBuildModifierOption,
    CustomBuildSpeciesOption,
  } from "./types";

  let {
    builds,
    editingBuild = null,
    speciesOptions,
    abilityOptions = [],
    itemOptions = [],
    importText = $bindable(""),
    importState = { status: "idle" },
    disabled = false,
    class: className,
    onCreateManual,
    onUpdateManual,
    onCancelEdit,
    onStartEdit,
    onDelete,
    onPreviewImport,
    onSaveImport,
    onClearImport,
  }: {
    builds: CustomBuildDisplayBuild[];
    editingBuild?: CustomBuildStored | null;
    speciesOptions: CustomBuildSpeciesOption[];
    abilityOptions?: CustomBuildModifierOption[];
    itemOptions?: CustomBuildModifierOption[];
    importText?: string;
    importState?: CustomBuildImportState;
    disabled?: boolean;
    class?: string;
    onCreateManual: (build: CustomBuildInput) => void;
    onUpdateManual: (id: CustomBuildId, build: CustomBuildInput) => void;
    onCancelEdit: () => void;
    onStartEdit: (build: CustomBuildDisplayBuild) => void;
    onDelete: (build: CustomBuildDisplayBuild) => void;
    onPreviewImport: (showdownText: string) => void;
    onSaveImport: (preview: CustomBuildImportPreview) => void;
    onClearImport?: () => void;
  } = $props();

  let activeTab = $state("manual");

  function startEdit(build: CustomBuildDisplayBuild) {
    activeTab = "manual";
    onStartEdit(build);
  }
</script>

<Card.Root class={cn("w-full", className)}>
  <Card.Header>
    <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div class="grid gap-1">
        <Card.Title>My builds</Card.Title>
        <Card.Description>
          Add custom Champions speed builds to compare with the tier list.
        </Card.Description>
      </div>
      <Badge variant="outline" class="self-start">
        <DeviceMobileIcon data-icon="inline-start" />
        Saved on this device
      </Badge>
    </div>
  </Card.Header>

  <Card.Content class="grid gap-6">
    <Tabs.Root bind:value={activeTab}>
      <Tabs.List class="grid w-full grid-cols-2">
        <Tabs.Trigger value="manual">
          {editingBuild ? "Edit build" : "Manual entry"}
        </Tabs.Trigger>
        <Tabs.Trigger value="import">Showdown import</Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="manual" class="mt-4">
        <ManualBuildForm
          value={editingBuild}
          {speciesOptions}
          {abilityOptions}
          {itemOptions}
          {disabled}
          submitLabel={editingBuild ? "Update build" : "Save build"}
          cancelLabel={editingBuild ? "Stop editing" : "Cancel"}
          onSubmit={(build) =>
            editingBuild ? onUpdateManual(editingBuild.id, build) : onCreateManual(build)}
          onCancel={editingBuild ? onCancelEdit : undefined}
        />
      </Tabs.Content>

      <Tabs.Content value="import" class="mt-4">
        <ShowdownImportForm
          bind:value={importText}
          state={importState}
          {disabled}
          onPreview={onPreviewImport}
          onSave={onSaveImport}
          onClear={onClearImport}
        />
      </Tabs.Content>
    </Tabs.Root>

    <SavedBuildsList
      {builds}
      {disabled}
      onEdit={startEdit}
      onDelete={onDelete}
    />
  </Card.Content>
</Card.Root>
