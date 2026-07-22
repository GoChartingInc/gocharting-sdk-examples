# Next.js · GoCharting SDK example

The GoCharting SDK in a Next.js (App Router) app. The key detail is that the SDK renders
to a browser canvas and must **never run during server-side rendering** — so the chart is
loaded client-side only.

Streams live market data (BYBIT BTCUSDT) over the GoCharting demo WebSocket. Requires network access.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

> `@gocharting/chart-sdk` is a **licensed package**, not on public npm. You need
> registry access (via a license) to install it — see [Getting the SDK](../README.md#getting-the-sdk)
> in the root README, which also covers evaluating against a local build.

## The SSR detail

`app/page.tsx` loads the chart with `next/dynamic` and `ssr: false`, which guarantees the
SDK only ever executes in the browser:

```tsx
"use client";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("./Chart"), { ssr: false });
```

`app/Chart.tsx` is a `"use client"` component that calls `createChart` inside `useEffect`
and tears it down with `chart.destroy()` on unmount — the same pattern as the
[react-typescript](../react-typescript) example.

## What to look at

- [`app/page.tsx`](./app/page.tsx) — client-only dynamic import of the chart.
- [`app/Chart.tsx`](./app/Chart.tsx) — the `createChart` integration.
- [`lib/ws-datafeed.ts`](./lib/ws-datafeed.ts) — WebSocket datafeed (getBars, resolveSymbol, subscribeTicks, searchSymbols). See the [demo-websocket guide](https://gocharting.com/sdk/docs/guides/demo-websocket).
