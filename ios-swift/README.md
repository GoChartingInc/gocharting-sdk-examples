# iOS (Swift) · GoCharting SDK example

The GoCharting SDK running in a `WKWebView`. The chart page is configured with
**`isNativeApp: true`** and **`nativeChrome: "none"`**, so the SDK renders the **mobile
canvas only** and this example builds its **own native menu bar** in UIKit
([`NativeMenuBar.swift`](./NativeMenuBar.swift)) — the full native integration where the
host owns all chrome.

The native bar (Interval · Type · Draw · Indicators) drives the chart through a small
JS bridge, **`window.gcMenu`**, defined in [`chart.html`](./Resources/chart.html). Each
button reads `gcMenu.snapshot()` to populate a native action sheet, and each selection
calls `gcMenu.act(action, arg)`. That bridge is shared by every platform's example, so
the two calls are identical in Kotlin / Dart / React Native — only the sheet UI differs.

> **Prefer no native menu code?** Set `nativeChrome: "toolbar"` in `chart.html` instead.
> The SDK then keeps its own JS bottom bar (interval, drawings, indicators, layers) and
> you get a working mobile chart with zero menu code. The top bar (symbol search /
> compare) stays hidden either way — that is always the host's job.


Ships a **self-contained mock datafeed** — synthetic BTCUSDT/ETHUSDT candles generated in
the page, no network of any kind. Native WebViews load `chart.html` from the app bundle, a
`file://` origin that hosted feeds reject, so a bundled feed is what lets these examples run
anywhere and offline. Swap in your own datafeed when you wire up real data — the interface
in `chart.html` is the whole contract.

## Setup

1. Create an iOS App in Xcode (UIKit, Swift), then add these files to the target:
   - `ChartViewController.swift`
   - `Resources/chart.html` — add as a **folder reference / bundle resource**
2. Copy the SDK bundle next to `chart.html` so `./index.umd.js` resolves:

   ```bash
   cp node_modules/@gocharting/chart-sdk/index.umd.js Resources/index.umd.js
   ```

   > `index.umd.js` is the **licensed** product and is gitignored here — never commit it.
   > See [Getting the SDK](../README.md#getting-the-sdk).

3. Make `ChartViewController` your root view controller and run.

## How it fits together

| Direction | Mechanism |
| --- | --- |
| **web → native** | The SDK calls `window.webkit.messageHandlers.ios.postMessage(obj)`. The controller registers that handler with `contentController.add(self, name: "ios")` and implements `WKScriptMessageHandler`. |
| **native → web** | `webView.evaluateJavaScript("window.chart.setSymbol(...)")`. `chart.html` keeps the chart on `window.chart` for exactly this. |

> **iOS differs from the others:** the SDK posts the **object** here (`[String: Any]`),
> while React Native / Flutter / Android receive a **JSON string**.

The page is loaded with `loadFileURL(_:allowingReadAccessTo:)` pointing at the enclosing
folder, which is what lets the relative `./index.umd.js` load.

Common event `type`s: `OPEN_CONTEXT_MENU`, `PLACE_ORDER`, `DOWNLOAD_MORE_DATA`,
`CHART_SELECTED`, `OPEN_SYMBOL_SEARCH`.

## What to look at

- [`ChartViewController.swift`](./ChartViewController.swift) — WKWebView setup, the
  `WKScriptMessageHandler` bridge, and `setSymbol` / `setInterval` / `setTheme` helpers.
- [`Resources/chart.html`](./Resources/chart.html) — the page the WebView loads.

## Related

- [Mobile Integration guide](https://gocharting.com/sdk/docs/guides/mobile-integration)
- [demo-websocket guide](https://gocharting.com/sdk/docs/guides/demo-websocket)
