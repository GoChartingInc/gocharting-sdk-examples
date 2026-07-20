# Nuxt 3 · GoCharting SDK example

The GoCharting SDK in a Nuxt 3 app. The SDK is browser-only, so the chart lives in a
**client-only component** (`.client.vue` suffix) that Nuxt never server-renders.

Runs against a synthetic offline datafeed — no backend needed once the package is installed.

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

The chart component is named [`components/Chart.client.vue`](./components/Chart.client.vue).
Nuxt's `.client` suffix renders it in the browser only, so the SDK never runs during SSR.
Chart creation is deferred one frame (`requestAnimationFrame`) so the container has its
final layout size before the canvas is measured.

## What to look at

- [`components/Chart.client.vue`](./components/Chart.client.vue) — `createChart` in `onMounted`,
  torn down with `chart.destroy()` in `onBeforeUnmount`.
- [`components/mock-datafeed.ts`](./components/mock-datafeed.ts) — synthetic datafeed; swap for your own provider.
