# Flutter · GoCharting SDK example

The GoCharting SDK running in [`webview_flutter`](https://pub.dev/packages/webview_flutter).
The chart page is configured with **`isNativeApp: true`** and **`nativeChrome: "none"`**, so
the SDK renders the **mobile canvas only** and this example builds its **own native menu
bar** in Dart ([`lib/native_menu_bar.dart`](./lib/native_menu_bar.dart)) — the full native
integration where the host owns all chrome.

The native bar (Interval · Type · Draw · Indicators) drives the chart through a small JS
bridge, **`window.gcMenu`**, defined in [`assets/chart.html`](./assets/chart.html). Each
button reads `gcMenu.snapshot()` to populate a `showModalBottomSheet`, and each selection
calls `gcMenu.act(action, arg)`. That bridge is shared by every platform's example, so the
two calls are identical in Swift / Kotlin / React Native — only the sheet UI differs.

> **Prefer no native menu code?** Set `nativeChrome: "toolbar"` in `chart.html` instead.
> The SDK then keeps its own JS bottom bar (interval, drawings, indicators, layers) and
> you get a working mobile chart with zero menu code. The top bar (symbol search /
> compare) stays hidden either way — that is always the host's job.

> **Grouped indicator picker.** The Indicators sheet groups the full catalog by
> **`groupName`** (Momentum, Oscillators, Overlay, …) — the same buckets the built-in
> menu shows. `gcMenu.snapshot()` exposes `indicators.catalog` from the SDK's
> **`chart.getStudiesCatalog()`**, which returns `{ type, name, groupName }` per
> indicator; the Dart side just buckets by `groupName` (see `_pickIndicators` in
> [`lib/native_menu_bar.dart`](./lib/native_menu_bar.dart)). Group **by `groupName`, not
> `category`** — `category` is null for most indicators. Needs an SDK build that exposes
> `getStudiesCatalog()`; on older bundles the picker falls back to a short curated list
> under "Other". The same two-line `snapshot()` addition works on every platform.


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
