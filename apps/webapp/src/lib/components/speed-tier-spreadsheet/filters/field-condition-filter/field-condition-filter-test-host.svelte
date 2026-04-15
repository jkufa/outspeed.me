<script lang="ts">
  import { Label } from "$lib/components/ui/label";
  import type { FieldConditionFilter } from "$lib/speed-tiers";
  import FieldConditionFilterControl from "./field-condition-filter.svelte";

  let {
    value = $bindable<FieldConditionFilter[]>([]),
    disabled = false,
  }: {
    value?: FieldConditionFilter[];
    disabled?: boolean;
  } = $props();
</script>

<div class="grid w-72 gap-2">
  <Label>Field Condition</Label>
  <FieldConditionFilterControl bind:value {disabled} />
  <output aria-label="Selected field conditions">{JSON.stringify(value)}</output>
</div>
