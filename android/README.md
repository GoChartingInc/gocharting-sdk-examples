# Android (Kotlin) · GoCharting SDK example

The GoCharting SDK running in an Android `WebView`. The chart page is configured with
**`isNativeApp: true`**, so the SDK renders the **mobile canvas only** — no JS toolbars.
Your Kotlin code owns all chrome (toolbars, sheets, order tickets) and talks to the chart
over a bridge.

> This example ships with **`nativeChrome: "toolbar"`**, which keeps the JS **bottom** bar (interval, drawing tools, indicators, layers) — those menus are platform-specific and hard to rebuild natively, so it gives you a working mobile chart immediately. The top bar (symbol search / compare) stays hidden; that is the host's job. Set `nativeChrome: "none"` in `chart.html` once you build your own native menus.


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
