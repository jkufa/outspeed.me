<script lang="ts">
  import * as Command from "$lib/components/ui/command";

  let {
    checked = false,
    onSelect,
  }: {
    checked?: boolean;
    onSelect: () => void;
  } = $props();
</script>

<Command.Item value="All" data-checked={checked} {onSelect}>All</Command.Item>
