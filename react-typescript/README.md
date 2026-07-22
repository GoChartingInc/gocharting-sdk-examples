# React + TypeScript · GoCharting SDK example

The GoCharting SDK embedded in a React component with typed configuration and proper mount/unmount lifecycle. Uses [Vite](https://vite.dev) for the dev server.

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

- [`src/Chart.tsx`](./src/Chart.tsx) — the integration: one `createChart` call inside
  `useEffect`, torn down with `chart.destroy()` on unmount (which also handles React
  Strict Mode's double-invoke in development).
- [`src/ws-datafeed.ts`](./src/ws-datafeed.ts) — the WebSocket datafeed implementing
  `getBars`, `resolveSymbol`, and `subscribeTicks` / `unsubscribeTicks`. Replace this
  with your own provider to show real data — the interface stays the same.

## The integration in full

```tsx
import { useEffect, useRef } from "react";
import * as GoChartingSDK from "@gocharting/chart-sdk";
import type { ChartWrapper } from "@gocharting/chart-sdk";
import { createWebSocketDatafeed, DEFAULT_SYMBOL } from "./ws-datafeed";

export function Chart() {
	const containerRef = useRef<HTMLDivElement>(null);
	const chartRef = useRef<ChartWrapper | null>(null);

	useEffect(() => {
		if (!containerRef.current) return;
		const chart = GoChartingSDK.createChart(containerRef.current, {
			symbol: DEFAULT_SYMBOL,
			interval: "5m",
			datafeed: createWebSocketDatafeed(),
			licenseKey: "YOUR_LICENSE_KEY",
			theme: "dark",
		});
		chartRef.current = chart;
		return () => {
			chartRef.current?.destroy();
			chartRef.current = null;
		};
	}, []);

	return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
```
