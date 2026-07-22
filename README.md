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

### Server-rendered

The server just renders the container and passes config into the page; the SDK still runs
in the browser.

| Example | Stack | Notes |
| --- | --- | --- |
| [`django`](./django) | Python / Django | Complete runnable project (`manage.py runserver`) |
| [`ruby-on-rails`](./ruby-on-rails) | Ruby / Rails | Controller + view + route to drop into a Rails app |

## Getting the SDK

The `@gocharting/chart-sdk` package is not on the public npm registry. Like TradingView's
Advanced Charts, it's distributed to licensed users only. To run these examples you need
two things:

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

## A note on the native examples

The web and Django examples are browser-tested. The four native hosts ship the integration
code plus the `chart.html` they load — building them needs the platform toolchain
(Android Studio, Xcode, Flutter SDK), so each README starts with the one-time scaffold
step for that platform. The `chart.html` itself **is** verified: it renders the
`isNativeApp` canvas with live data and posts to the native bridge.

The Rails example ships as controller + view + route to drop into a `rails new` app,
rather than a full generated application.

## License

[MIT](./LICENSE)
