<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import * as GoChartingSDK from "@gocharting/chart-sdk";
	import type { ChartWrapper } from "@gocharting/chart-sdk";
	import { createMockDatafeed, SYMBOL } from "./mock-datafeed";

	// Demo license key — replace with your own from the GoCharting dashboard.
	const LICENSE_KEY = "demo-550e8400-e29b-41d4-a716-446655440000";

	let container: HTMLDivElement;
	let chart: ChartWrapper | null = null;

	// onMount only runs in the browser, so the SDK never executes during SSR.
	onMount(() => {
		chart = GoChartingSDK.createChart(container, {
			symbol: SYMBOL,
			interval: "1D",
			datafeed: createMockDatafeed(),
			licenseKey: LICENSE_KEY,
			theme: "dark",
		});
	});

	onDestroy(() => {
		chart?.destroy();
		chart = null;
	});
</script>

<div bind:this={container} style="width: 100%; height: 100%"></div>
