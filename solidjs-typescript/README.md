# SolidJS + TypeScript · GoCharting SDK example

The GoCharting SDK in a SolidJS component using `onMount` / `onCleanup` and [Vite](https://vite.dev).

Runs against a synthetic offline datafeed — no backend needed once the package is installed.

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
- [`src/mock-datafeed.ts`](./src/mock-datafeed.ts) — synthetic datafeed; swap for your own provider.
