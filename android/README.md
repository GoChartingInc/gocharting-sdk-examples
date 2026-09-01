# Android (Kotlin) · GoCharting SDK example

The GoCharting SDK running in an Android `WebView`. The chart page is configured with
**`isNativeApp: true`** and **`nativeChrome: "none"`**, so the SDK renders the **mobile
canvas only** and this example builds its **own native menu bar** in Kotlin
([`NativeMenuBar.kt`](./app/src/main/java/com/gocharting/example/NativeMenuBar.kt)) — the
full native integration where the host owns all chrome.

The native bar (Interval · Type · Draw · Indicators) drives the chart through a small
JS bridge, **`window.gcMenu`**, defined in [`chart.html`](./app/src/main/assets/chart.html).
Each button reads `gcMenu.snapshot()` to populate a native `AlertDialog`, and each
selection calls `gcMenu.act(action, arg)`. That bridge is shared by every platform's
example, so the two calls are identical in Swift / Dart / React Native — only the list UI
differs. The bar is plain framework widgets, so this example stays dependency-free.

> **Prefer no native menu code?** Set `nativeChrome: "toolbar"` in `chart.html` instead.
> The SDK then keeps its own JS bottom bar (interval, drawings, indicators, layers) and
> you get a working mobile chart with zero menu code. The top bar (symbol search /
> compare) stays hidden either way — that is always the host's job.

> **Grouped indicator picker.** `gcMenu.snapshot()` exposes `indicators.catalog` from the
> SDK's **`chart.getStudiesCatalog()`** (`{ type, name, groupName }` per indicator).
> `pickIndicators` in [`NativeMenuBar.kt`](./app/src/main/java/com/gocharting/example/NativeMenuBar.kt)
> buckets by **`groupName`** (Momentum, Oscillators, Overlay, …) and drills into a second
> dialog per group — a list dialog can't render headers. Group **by `groupName`, not
> `category`** — `category` is null for most indicators. Needs an SDK build that exposes
> `getStudiesCatalog()`; older bundles fall back to a short curated list under "Other".


Ships a **self-contained mock datafeed** — synthetic BTCUSDT/ETHUSDT candles generated in
the page, no network of any kind. Native WebViews load `chart.html` from the app bundle, a
`file://` origin that hosted feeds reject, so a bundled feed is what lets these examples run
anywhere and offline. Swap in your own datafeed when you wire up real data — the interface
in `chart.html` is the whole contract.

(The manifest keeps the `INTERNET` permission, since your own datafeed will need it.)

## Setup

1. Open this folder in **Android Studio** (or run `gradle wrapper` to generate the wrapper).
2. Copy the SDK bundle into the assets folder next to `chart.html`:

   ```bash
   cp node_modules/@gocharting/chart-sdk/index.umd.js \
      app/src/main/assets/index.umd.js
   ```

   > `index.umd.js` is the **licensed** product and is gitignored here — never commit it.
   > See [Getting the SDK](../README.md#getting-the-sdk).

3. Run the app.

## How it fits together

| Direction | Mechanism |
| --- | --- |
| **web → native** | The SDK calls `window.Android.postMessage(json)`. `ChartActivity` registers that global via `addJavascriptInterface(ChartBridge(), "Android")`; every `appCallback` event arrives as a JSON string. |
| **native → web** | `webView.evaluateJavascript("window.chart.setSymbol(...)")`. `chart.html` keeps the chart on `window.chart` for exactly this. |

Common event `type`s: `OPEN_CONTEXT_MENU`, `PLACE_ORDER`, `DOWNLOAD_MORE_DATA`,
`CHART_SELECTED`, `OPEN_SYMBOL_SEARCH`.

## What to look at

- [`app/src/main/java/com/gocharting/example/ChartActivity.kt`](./app/src/main/java/com/gocharting/example/ChartActivity.kt) —
  the WebView setup, the `@JavascriptInterface` bridge, and `setSymbol` / `setInterval` /
  `setTheme` helpers that drive the chart from native code.
- [`app/src/main/assets/chart.html`](./app/src/main/assets/chart.html) — the page the
  WebView loads: creates the chart with `isNativeApp: true` and includes the WebSocket
  datafeed inline.

## Related

- [Mobile Integration guide](https://gocharting.com/sdk/docs/guides/mobile-integration)
- [demo-websocket guide](https://gocharting.com/sdk/docs/guides/demo-websocket)
