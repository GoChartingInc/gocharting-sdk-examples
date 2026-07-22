# SolidJS + TypeScript · GoCharting SDK example

The GoCharting SDK in a SolidJS component using `onMount` / `onCleanup` and [Vite](https://vite.dev).

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

- [`src/Chart.tsx`](./src/Chart.tsx) — the integration: `createChart` in `onMount`, torn
  down with `chart.destroy()` in `onCleanup`, using a `ref` for the container element.
- [`src/ws-datafeed.ts`](./src/ws-datafeed.ts) — WebSocket datafeed (getBars, resolveSymbol, subscribeTicks, searchSymbols). See the [demo-websocket guide](https://gocharting.com/sdk/docs/guides/demo-websocket).
