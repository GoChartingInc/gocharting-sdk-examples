# JavaScript · GoCharting SDK example

The smallest possible integration — no framework, just a `createChart` call against a
DOM element. Uses [Vite](https://vite.dev) to serve ES modules; the SDK itself needs no
build step beyond bundling.

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

- [`src/main.js`](./src/main.js) — the whole integration: import the SDK, call
  `createChart("#chart", { ... })`.
- [`src/ws-datafeed.js`](./src/ws-datafeed.js) — the WebSocket datafeed implementing
  `getBars`, `resolveSymbol`, and `subscribeTicks` / `unsubscribeTicks`. Replace with
  your own provider for real data.

## The integration in full

```js
import * as GoChartingSDK from "@gocharting/chart-sdk";
import { createWebSocketDatafeed, DEFAULT_SYMBOL } from "./ws-datafeed.js";

const chart = GoChartingSDK.createChart("#chart", {
	symbol: DEFAULT_SYMBOL,
	interval: "5m",
	datafeed: createWebSocketDatafeed(),
	licenseKey: "YOUR_LICENSE_KEY",
	theme: "dark",
});
```

```html
<div id="chart" style="width: 100vw; height: 100vh"></div>
```
