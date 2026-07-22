# React (JavaScript) · GoCharting SDK example

The GoCharting SDK in a plain React component (no TypeScript), built with [Vite](https://vite.dev).
The TypeScript variant is in [../react-typescript](../react-typescript).

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

- [`src/Chart.jsx`](./src/Chart.jsx) — the integration: one `createChart` call inside
  `useEffect`, torn down with `chart.destroy()` on unmount.
- [`src/ws-datafeed.js`](./src/ws-datafeed.js) — WebSocket datafeed (getBars, resolveSymbol, subscribeTicks, searchSymbols). See the [demo-websocket guide](https://gocharting.com/sdk/docs/guides/demo-websocket).
