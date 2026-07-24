# iOS (Swift) · GoCharting SDK example

The GoCharting SDK running in a `WKWebView`. The chart page is configured with
**`isNativeApp: true`**, so the SDK renders the **mobile canvas only** — no JS toolbars.
Your Swift code owns all chrome (toolbars, sheets, order tickets) and talks to the chart
over a bridge.

> This example ships with **`nativeChrome: "toolbar"`**, which keeps the JS **bottom** bar (interval, drawing tools, indicators, layers) — those menus are platform-specific and hard to rebuild natively, so it gives you a working mobile chart immediately. The top bar (symbol search / compare) stays hidden; that is the host's job. Set `nativeChrome: "none"` in `chart.html` once you build your own native menus.


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
