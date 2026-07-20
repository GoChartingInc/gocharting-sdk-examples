<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from "vue";
import * as GoChartingSDK from "@gocharting/chart-sdk";
import type { ChartWrapper } from "@gocharting/chart-sdk";
import { createMockDatafeed, SYMBOL } from "./mock-datafeed";

// Demo license key — replace with your own from the GoCharting dashboard.
const LICENSE_KEY = "demo-550e8400-e29b-41d4-a716-446655440000";

const container = ref<HTMLDivElement | null>(null);
let chart: ChartWrapper | null = null;

onMounted(() => {
	// Defer to after the first paint so the container has its final layout
	// size — under Nuxt's client-only hydration onMounted can fire before the
	// flex layout resolves, which would size the chart canvas to 0.
	requestAnimationFrame(() => {
		if (!container.value) return;
		chart = GoChartingSDK.createChart(container.value, {
			symbol: SYMBOL,
			interval: "1D",
			datafeed: createMockDatafeed(),
			licenseKey: LICENSE_KEY,
			theme: "dark",
		});
	});
});

onBeforeUnmount(() => {
	chart?.destroy();
	chart = null;
});
</script>

<template>
	<div ref="container" style="width: 100%; height: 100%" />
</template>
