import { onMount, onCleanup } from "solid-js";
import * as GoChartingSDK from "@gocharting/chart-sdk";
import type { ChartWrapper } from "@gocharting/chart-sdk";
import { createWebSocketDatafeed, DEFAULT_SYMBOL } from "./ws-datafeed";

// Demo license key — replace with your own from the GoCharting dashboard.
const LICENSE_KEY = "demo-550e8400-e29b-41d4-a716-446655440000";

export function Chart() {
	let container: HTMLDivElement | undefined;
	let chart: ChartWrapper | null = null;

	onMount(() => {
		if (!container) return;
		chart = GoChartingSDK.createChart(container, {
			symbol: DEFAULT_SYMBOL,
			interval: "5m",
			datafeed: createWebSocketDatafeed(),
			licenseKey: LICENSE_KEY,
			theme: "dark",
		});
	});

	onCleanup(() => {
		chart?.destroy();
		chart = null;
	});

	return <div ref={container} style={{ width: "100%", height: "100%" }} />;
}
