# SvelteKit · GoCharting SDK example

The GoCharting SDK in a SvelteKit app. The SDK renders to a browser canvas and must not run
during SSR, so the chart route opts out of server rendering.

Runs against a synthetic offline datafeed — no backend needed once the package is installed.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

> `@gocharting/chart-sdk` is a **licensed package**, not on public npm. You need
> registry access (via a license) to install it — see [Getting the SDK](../README.md#getting-the-sdk)
> in the root README, which also covers evaluating against a local build.

## The SSR detail

[`src/routes/+page.ts`](./src/routes/+page.ts) sets `export const ssr = false`, and the chart
is created inside Svelte's `onMount` — which only runs in the browser. Together they guarantee
the SDK never executes on the server.

## What to look at

- [`src/lib/Chart.svelte`](./src/lib/Chart.svelte) — `createChart` in `onMount`, torn down
  with `chart.destroy()` in `onDestroy`, using `bind:this` for the container element.
- [`src/lib/mock-datafeed.ts`](./src/lib/mock-datafeed.ts) — synthetic datafeed; swap for your own provider.
