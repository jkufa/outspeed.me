<script lang="ts">
	import { Badge } from "$lib/components/ui/badge";
	import { effectsToChips } from "$lib/speed-tiers";
	import type { EffectChip, SpeedEffect } from "$lib/speed-tiers";

	let { effects }: { effects: SpeedEffect[] } = $props();

	const chips = $derived(effectsToChips(effects));

	function variantForChip(chip: EffectChip) {
		if (chip.kind === "multiplier") {
			return "default";
		}

		if (chip.kind === "ability") {
			return "secondary";
		}

		if (chip.kind === "stage") {
			return "destructive";
		}

		if (chip.kind === "item") {
			return "outline";
		}

		return "ghost";
	}
</script>

<div class="flex flex-wrap gap-1.5">
	{#each chips as chip (chip.key)}
		<Badge variant={variantForChip(chip)}>{chip.label}</Badge>
	{/each}
</div>
