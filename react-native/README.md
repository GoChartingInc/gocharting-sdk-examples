# React Native · GoCharting SDK example

The GoCharting SDK running in [`react-native-webview`](https://github.com/react-native-webview/react-native-webview).
The chart page is configured with **`isNativeApp: true`** and **`nativeChrome: "none"`**, so
the SDK renders the **mobile canvas only** and this example builds its **own native menu
bar** ([`NativeMenuBar.tsx`](./NativeMenuBar.tsx)) — the full native integration where the
host owns all chrome.

The native bar (Interval · Type · Draw · Indicators) drives the chart through a small JS
bridge, **`window.gcMenu`**, defined in [`assets/chart.html`](./assets/chart.html). Each
selection calls `gcMenu.act(action, arg)`. Reading menu state is the one platform
difference: `injectJavaScript` is fire-and-forget, so `gcMenu.snapshot()` posts its result
back over the message channel, and [`App.tsx`](./App.tsx) turns that into a Promise
(`requestSnapshot`). The `gcMenu` calls are otherwise identical to the Swift / Kotlin /
Dart examples — only the sheet UI (a `Modal`) differs.

> **Prefer no native menu code?** Set `nativeChrome: "toolbar"` in `chart.html` instead.
> The SDK then keeps its own JS bottom bar (interval, drawings, indicators, layers) and
> you get a working mobile chart with zero menu code. The top bar (symbol search /
> compare) stays hidden either way — that is always the host's job.
>
> **Loading the SDK bundle in debug.** `require("./assets/chart.html")` bundles the page
> as a native asset, and in a **release** build its sibling `index.umd.js` loads from the
> app bundle. In **debug**, Metro serves the page and refuses the `.js` sibling (it is a
> source extension, not an asset), so the chart is blank. For a debug run, serve the two
> files over `http://localhost` and point the WebView at that URL, or test in release.

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
