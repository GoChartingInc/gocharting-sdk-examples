# WebSocket datafeed · GoCharting SDK example

Unlike every other example in this repo (which use a synthetic **offline** feed), this one
streams **real market data** from the GoCharting demo WebSocket — historical candles plus
live trades. It's the datafeed you'd model your own provider on.

> Requires network access. The demo feed is allowlisted to two symbols
> (`BYBIT:FUTURE:BTCUSDT`, `BYBIT:FUTURE:ETHUSDT`) and rate-limited to ~5 connections per IP.
> Protocol reference: [demo-websocket guide](https://gocharting.com/sdk/docs/guides/demo-websocket).

## Run it

```bash
npm install
npm run dev
```

Then open the printed URL (default http://localhost:5173). You should see a live BTCUSDT
chart whose last candle updates in real time.

> `@gocharting/chart-sdk` is a **licensed package**, not on public npm. You need
> registry access (via a license) to install it — see [Getting the SDK](../README.md#getting-the-sdk)
> in the root README, which also covers evaluating against a local build.

## What to look at

- [`src/ws-datafeed.ts`](./src/ws-datafeed.ts) — the whole datafeed. This is the piece that
  matters: it implements the SDK's `Datafeed` interface over a WebSocket.
- [`src/main.ts`](./src/main.ts) — one `createChart` call wiring the datafeed to a real symbol.

## How the datafeed maps to the protocol

| SDK method | Wire protocol |
| --- | --- |
| `getBars` | sends `{ command: "timeseries", payload: { symbol, interval, session, hint } }`; collects chunked responses until `final: 1\|2`, returns UDF (`{ s, t, o, h, l, c, v }`) |
| `subscribeTicks` | `{ command: "SUBSCRIBE", channel: "trade", payload: [symbol] }`; incoming `trade` payloads become realtime callbacks |
| `unsubscribeTicks` | `{ command: "UNSUBSCRIBE", channel: "trade", payload: [symbol] }` |
| `resolveSymbol` | returns static metadata for the two allowlisted symbols (note: **`segment` is required** — the SDK rebuilds the `exchange:segment:symbol` key from it) |
| `searchSymbols` | REST `GET /sdk/instruments/search?q=…` |

A 20-second PING keeps the socket alive; the connection is opened lazily on the first
`getBars`/`subscribeTicks` and shared across requests.

## Using this feed in the other examples

`ws-datafeed.ts` is framework-agnostic. To make any example (React, Vue, Angular, …) use
real data, swap the import:

```ts
// before — synthetic offline feed
import { createMockDatafeed, SYMBOL } from "./mock-datafeed";
// after — real WebSocket feed
import { createWebSocketDatafeed as createMockDatafeed, DEFAULT_SYMBOL as SYMBOL } from "./ws-datafeed";
```

(The examples default to the offline feed so they run with no network.)
