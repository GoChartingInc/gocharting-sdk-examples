# GoCharting SDK Examples

Minimal, self-contained examples of integrating the [GoCharting SDK](https://www.gocharting.com) with different frameworks, build tools, and data transports. Each example is a standalone project — clone the repo, `cd` into the one you want, install, and run.

> **The GoCharting SDK is a licensed product**, distributed as a compiled package — not open source. These examples are public integration *templates*; running them requires access to the `@gocharting/chart-sdk` package and a license key. See [Getting the SDK](#getting-the-sdk).

Every example streams **live market data** (BYBIT BTCUSDT) over the GoCharting demo WebSocket and ships with a **demo license key**, so once you have package access they run against real data out of the box. They require network access. Point the datafeed at your own provider once you've seen it work — see [Connecting real data](#connecting-real-data).

## Examples

### Web

Each of these wires the same [`ws-datafeed`](./datafeed-websocket/src/ws-datafeed.ts) into its framework's lifecycle:

| Example | Framework | Build tool | Notes |
| --- | --- | --- | --- |
| [`javascript`](./javascript) | None (vanilla) | Vite | Smallest possible integration — one `createChart` call |
| [`react-typescript`](./react-typescript) | React + TypeScript | Vite | Typed `createChart`, mount/unmount lifecycle |
| [`react-javascript`](./react-javascript) | React (JavaScript) | Vite | Same integration without TypeScript |
| [`nextjs`](./nextjs) | Next.js (App Router) | Next | Client-only dynamic import (`ssr: false`) |
| [`vue`](./vue) | Vue 3 | Vite | Composition API, template ref lifecycle |
| [`nuxtjs3`](./nuxtjs3) | Nuxt 3 | Nuxt | Client-only component (`.client.vue`) |
| [`sveltekit`](./sveltekit) | SvelteKit | Vite | `ssr: false` route + `onMount` |
| [`solidjs-typescript`](./solidjs-typescript) | SolidJS + TypeScript | Vite | `onMount` / `onCleanup` lifecycle |
| [`angular`](./angular) | Angular | Angular CLI | Standalone component, lifecycle hooks |
| [`datafeed-websocket`](./datafeed-websocket) | None (vanilla) | Vite | Focused walkthrough of the datafeed itself |

### Native (WebView hosts)

The SDK is a browser library, so native apps embed it in a WebView. These load a
`chart.html` configured with **`isNativeApp: true`** — the SDK renders the **chart canvas
only** (no JS toolbars) and posts every event to the native bridge, so your app owns the
chrome. Native code drives the chart back via `window.chart`.

| Example | Platform | WebView | Bridge global |
| --- | --- | --- | --- |
| [`android`](./android) | Android (Kotlin) | `WebView` | `window.Android` (`@JavascriptInterface`) |
| [`ios-swift`](./ios-swift) | iOS (Swift) | `WKWebView` | `window.webkit.messageHandlers.ios` |
| [`react-native`](./react-native) | React Native | `react-native-webview` | `window.ReactNativeWebView` |
| [`flutter`](./flutter) | Flutter (Dart) | `webview_flutter` | `window.Flutter` (JS channel) |

See the [Mobile Integration guide](https://gocharting.com/sdk/docs/guides/mobile-integration)
for the full event surface.

> **Known issue — the demo feed rejects `file://` origins.** Native WebViews load
> `chart.html` from the app bundle/assets, which is a `file://` origin, and
> `wss://gocharting.com/sdk/ws` refuses the handshake (close code 1006) — so the chart
> renders but shows *"Request timed out"* instead of data. This is a **server-side origin
> allowlist, not a WebView restriction**: in the same WKWebView, from the same `file://`
> page, a public echo WebSocket connects fine, and serving the identical `chart.html` over
> `http://localhost` streams live bars. Until the demo feed accepts it, either point these
> examples at your own feed, or give the page an http(s) origin — on Android via
> [`WebViewAssetLoader`](https://developer.android.com/reference/androidx/webkit/WebViewAssetLoader)
> (`https://appassets.androidplatform.net/`), on iOS via a `WKURLSchemeHandler` or a local
> server. Your own datafeed is unaffected unless it does the same origin check.

### Server-rendered

The server just renders the container and passes config into the page; the SDK still runs
in the browser.

| Example | Stack | Notes |
| --- | --- | --- |
| [`django`](./django) | Python / Django | Complete runnable project (`manage.py runserver`) |
| [`ruby-on-rails`](./ruby-on-rails) | Ruby / Rails | Controller + view + route to drop into a Rails app |

## Getting the SDK

The `@gocharting/chart-sdk` package is not on the public npm registry — it's distributed to
licensed users only. To run these examples you need two things:

1. **Package access** — request a license at [gocharting.com](https://www.gocharting.com).
   You'll receive access to the private `@gocharting/chart-sdk` package and instructions to
   authenticate npm against the GoCharting registry (a scoped auth token in your
   `~/.npmrc`). After that, `npm install` in any example resolves the package normally.
2. **A license key** — supplied with your access. The examples ship with a **demo key**
   (`demo-…`) that works out of the box for local evaluation; replace it with your own key
   for production. The key is validated at runtime and gates premium features and expiry.

> **Evaluating without a license yet?** Point the examples at a local build of the SDK
> instead of the registry. In an example's `package.json`, set
> `"@gocharting/chart-sdk": "file:/path/to/GoCharting-SDK/dist"`, then `npm install`.

## Quick start

```bash
# after completing "Getting the SDK" above (registry auth in ~/.npmrc)
git clone https://github.com/GoChartingInc/gocharting-sdk-examples.git
cd gocharting-sdk-examples/react-typescript
npm install
npm run dev
```

## The minimal integration

Every example boils down to this:

```js
import * as GoChartingSDK from "@gocharting/chart-sdk";

const chart = GoChartingSDK.createChart("#chart", {
  symbol: "BYBIT:FUTURE:BTCUSDT",
  interval: "5m",
  datafeed: myDatafeed,        // implements getBars + resolveSymbol
  licenseKey: "YOUR_LICENSE_KEY",
  theme: "dark",
});

// later:
chart.destroy();
```

The **datafeed** is the only substantial piece you write. At minimum it implements two methods:

- `getBars(symbolInfo, resolution, periodParams)` → historical OHLCV bars
- `resolveSymbol(symbolName, onResolve, onError)` → symbol metadata

Optionally add `subscribeTicks` / `unsubscribeTicks` for real-time updates and `searchSymbols` for the symbol search box. See the shared [datafeed reference](#connecting-real-data).

## Connecting real data

Every example uses the same [`ws-datafeed`](./datafeed-websocket/src/ws-datafeed.ts), which implements the SDK's `Datafeed` interface (`getBars`, `resolveSymbol`, `subscribeTicks`/`unsubscribeTicks`, `searchSymbols`) over the GoCharting demo WebSocket. The [`datafeed-websocket`](./datafeed-websocket) example is a focused walkthrough of how it maps to the wire protocol.

To use your own data, replace `ws-datafeed` with a datafeed that talks to your provider — the interface is identical. The demo feed is allowlisted to two symbols (`BYBIT:FUTURE:BTCUSDT`, `BYBIT:FUTURE:ETHUSDT`) and rate-limited to ~5 connections per IP.

## Verification status

Every example here has been built and/or run, with one exception:

| Example | Verified by |
| --- | --- |
| All 10 web examples | Rendered in a browser against the live feed |
| `chart.html` (the WebView payload) | Rendered on a mobile viewport — `isNativeApp` canvas, and confirmed the SDK posts to a stubbed native bridge |
| `django` | `manage.py runserver` + chart rendered |
| `ruby-on-rails` | Files dropped into a real `rails new` app, served, chart rendered |
| `react-native` | `tsc` clean + `react-native bundle` (chart.html ships as an asset) |
| `android` | `gradle assembleDebug` → APK with the Kotlin bridge compiled and assets packaged |
| `flutter` | `flutter analyze` clean + `flutter build apk` with assets bundled |
| `ios-swift` | Built with `xcodebuild -sdk iphonesimulator` and **run in the iOS 26.5 simulator** — live BTCUSDT candles rendered. See the origin caveat below |

> The four native examples were verified **built and launched**. Only `ios-swift` was run
> against live data, and only after working around the `file://` origin issue above — with
> the page served over http, it streams; from the bundle, it renders but times out. Expect
> the same on Android, Flutter, and React Native, since they load the page the same way.

The native examples ship the integration code plus the `chart.html` they load; each README
starts with the one-time scaffold step for that platform (`flutter create .`,
`npx @react-native-community/cli init`, opening in Android Studio / Xcode). The Rails
example ships as controller + view + route to drop into a `rails new` app.

## License

[MIT](./LICENSE)
