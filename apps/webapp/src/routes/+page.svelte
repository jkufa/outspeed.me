<script lang="ts">
	import SpeedTierSpreadsheet from "$lib/components/speed-tier-spreadsheet/speed-tier-spreadsheet.svelte";

	let { data } = $props();
</script>

<SpeedTierSpreadsheet
  fullDataUrl={data.fullDataUrl}
  returnedRows={data.returnedRows}
  tiers={data.tiers}
  totalRows={data.totalRows}
/>
