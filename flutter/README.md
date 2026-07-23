# Flutter · GoCharting SDK example

The GoCharting SDK running in [`webview_flutter`](https://pub.dev/packages/webview_flutter).
The chart page is configured with **`isNativeApp: true`**, so the SDK renders the **mobile
canvas only** — no JS toolbars. Your Dart code owns all chrome and talks to the chart over
a JavaScript channel.

Ships a **self-contained mock datafeed** — synthetic BTCUSDT/ETHUSDT candles generated in
the page, no network of any kind. Native WebViews load `chart.html` from the app bundle, a
`file://` origin that hosted feeds reject, so a bundled feed is what lets these examples run
anywhere and offline. Swap in your own datafeed when you wire up real data — the interface
in `chart.html` is the whole contract.

## Setup

1. Scaffold the platform folders (this example ships only `lib/`, `assets/`, `pubspec.yaml`):

   ```bash
   flutter create .
   flutter pub get
   ```

   > `flutter create` also scaffolds `test/widget_test.dart` referencing a `MyApp`
   > class. This example's root widget is `GoChartingApp`, so either update that
   > test or delete it — it isn't part of the build.

2. Copy the SDK bundle next to `chart.html`:

   ```bash
   cp node_modules/@gocharting/chart-sdk/index.umd.js assets/index.umd.js
   ```

   > `index.umd.js` is the **licensed** product and is gitignored here — never commit it.
   > See [Getting the SDK](../README.md#getting-the-sdk).

3. `flutter run`.

## How it fits together

| Direction | Mechanism |
| --- | --- |
| **web → native** | The channel **must be named `Flutter`** — the SDK calls `window.Flutter.postMessage(json)`. Registered via `addJavaScriptChannel('Flutter', ...)`; events arrive as a JSON string. |
| **native → web** | `controller.runJavaScript("window.chart.setSymbol(...)")`. `chart.html` keeps the chart on `window.chart`. |

The page is loaded with `loadFlutterAsset('assets/chart.html')`, and `pubspec.yaml`
declares `assets/` so both the HTML and the UMD bundle ship with the app.

Common event `type`s: `OPEN_CONTEXT_MENU`, `PLACE_ORDER`, `DOWNLOAD_MORE_DATA`,
`CHART_SELECTED`, `OPEN_SYMBOL_SEARCH`.

## What to look at

- [`lib/main.dart`](./lib/main.dart) — the `WebViewController`, the `Flutter` JS channel,
  and `setSymbol` / `setInterval` / `setTheme` helpers.
- [`assets/chart.html`](./assets/chart.html) — the page the WebView loads.

## Related

- [Mobile Integration guide](https://gocharting.com/sdk/docs/guides/mobile-integration)
- [demo-websocket guide](https://gocharting.com/sdk/docs/guides/demo-websocket)
