# Vue 3 · GoCharting SDK example

The GoCharting SDK in a Vue 3 single-file component using the Composition API and
[Vite](https://vite.dev).

Streams live market data (BYBIT BTCUSDT) over the GoCharting demo WebSocket. Requires network access.

## Run it

```bash
npm install
npm run dev
```

Then open the printed URL (default http://localhost:5173).

> `@gocharting/chart-sdk` is a **licensed package**, not on public npm. You need
> registry access (via a license) to install it — see [Getting the SDK](../README.md#getting-the-sdk)
> in the root README, which also covers evaluating against a local build.

## What to look at

- [`src/Chart.vue`](./src/Chart.vue) — the integration: `createChart` in `onMounted`,
  torn down with `chart.destroy()` in `onBeforeUnmount`, using a template ref for the
  container element.
- [`src/ws-datafeed.ts`](./src/ws-datafeed.ts) — WebSocket datafeed (getBars, resolveSymbol, subscribeTicks, searchSymbols). See the [demo-websocket guide](https://gocharting.com/sdk/docs/guides/demo-websocket).

## The integration in full

```vue
<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from "vue";
import * as GoChartingSDK from "@gocharting/chart-sdk";
import type { ChartWrapper } from "@gocharting/chart-sdk";
import { createWebSocketDatafeed, DEFAULT_SYMBOL } from "./ws-datafeed";

const container = ref<HTMLDivElement | null>(null);
let chart: ChartWrapper | null = null;

onMounted(() => {
	if (!container.value) return;
	chart = GoChartingSDK.createChart(container.value, {
		symbol: DEFAULT_SYMBOL,
		interval: "5m",
		datafeed: createWebSocketDatafeed(),
		licenseKey: "YOUR_LICENSE_KEY",
		theme: "dark",
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
```
