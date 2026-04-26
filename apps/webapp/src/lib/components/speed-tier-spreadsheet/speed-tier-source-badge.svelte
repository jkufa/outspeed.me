<script lang="ts">
  import { Badge } from "$lib/components/ui/badge";
  import type { SpeedTierRowSource } from "$lib/speed-tiers";

  let { source }: { source?: SpeedTierRowSource } = $props();
</script>

{#if source?.kind === "custom-build"}
  <Badge
    variant="outline"
    class="border-primary/35 bg-primary/10 text-primary whitespace-nowrap"
  >
    My build
  </Badge>
{/if}
