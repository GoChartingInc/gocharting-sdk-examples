# React Native · GoCharting SDK example

The GoCharting SDK running in [`react-native-webview`](https://github.com/react-native-webview/react-native-webview).
The chart page is configured with **`isNativeApp: true`**, so the SDK renders the **mobile
canvas only** — no JS toolbars. Your RN code owns all chrome and talks to the chart over
the WebView bridge.

Ships a **self-contained mock datafeed** — synthetic BTCUSDT/ETHUSDT candles generated in
the page, no network of any kind. Native WebViews load `chart.html` from the app bundle, a
`file://` origin that hosted feeds reject, so a bundled feed is what lets these examples run
anywhere and offline. Swap in your own datafeed when you wire up real data — the interface
in `chart.html` is the whole contract.

## Setup

1. Scaffold an app and copy these files in (or use this folder as the app root):

   ```bash
   npx @react-native-community/cli init GoChartingExample
   # then replace App.tsx and add assets/ + metro.config.js
   npm install react-native-webview
   cd ios && pod install && cd ..   # iOS only
   ```

2. Copy the SDK bundle next to `chart.html`:

   ```bash
   cp node_modules/@gocharting/chart-sdk/index.umd.js assets/index.umd.js
   ```

   > `index.umd.js` is the **licensed** product and is gitignored here — never commit it.
   > See [Getting the SDK](../README.md#getting-the-sdk).

3. `npm run android` / `npm run ios`.

## How it fits together

| Direction | Mechanism |
| --- | --- |
| **web → native** | `react-native-webview` injects `window.ReactNativeWebView`; the SDK posts to it and you receive events in `onMessage` as a JSON string. |
| **native → web** | `webRef.current.injectJavaScript("window.chart.setSymbol(...)")`. `chart.html` keeps the chart on `window.chart`. |

`metro.config.js` adds `html` to `assetExts` so `require("./assets/chart.html")` resolves
and the page ships inside the app bundle.

Common event `type`s: `OPEN_CONTEXT_MENU`, `PLACE_ORDER`, `DOWNLOAD_MORE_DATA`,
`CHART_SELECTED`, `OPEN_SYMBOL_SEARCH`.

## What to look at

- [`App.tsx`](./App.tsx) — the WebView, `onMessage` handler, and the `injectJavaScript`
  helpers that drive the chart.
- [`assets/chart.html`](./assets/chart.html) — the page the WebView loads.

## Related

- [Mobile Integration guide](https://gocharting.com/sdk/docs/guides/mobile-integration)
- [demo-websocket guide](https://gocharting.com/sdk/docs/guides/demo-websocket)
