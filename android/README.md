# Android (Kotlin) · GoCharting SDK example

The GoCharting SDK running in an Android `WebView`. The chart page is configured with
**`isNativeApp: true`**, so the SDK renders the **mobile canvas only** — no JS toolbars.
Your Kotlin code owns all chrome (toolbars, sheets, order tickets) and talks to the chart
over a bridge.

Streams live market data (BYBIT BTCUSDT) over the GoCharting demo WebSocket. Requires
network access (`INTERNET` permission is already in the manifest).

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
