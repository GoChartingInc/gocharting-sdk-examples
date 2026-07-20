# GoCharting SDK Examples

Minimal, self-contained examples of integrating the [GoCharting SDK](https://www.gocharting.com) with different frameworks, build tools, and data transports. Each example is a standalone project — clone the repo, `cd` into the one you want, install, and run.

> **The GoCharting SDK is a licensed product**, distributed as a compiled package — not open source. These examples are public integration *templates*; running them requires access to the `@gocharting/chart-sdk` package and a license key. See [Getting the SDK](#getting-the-sdk).

Every example ships with a synthetic **offline datafeed** and a **demo license key**, so once you have package access they run with no backend and no network. Swap the datafeed for your own once you've seen it work — see [Connecting real data](#connecting-real-data).

## Examples

| Example | Framework | Build tool | Live data | Notes |
| --- | --- | --- | --- | --- |
| [`javascript`](./javascript) | None (vanilla) | Vite | ✅ | Smallest possible integration — one `createChart` call |
| [`react-typescript`](./react-typescript) | React + TypeScript | Vite | ✅ | Typed `createChart`, mount/unmount lifecycle |
| [`react-javascript`](./react-javascript) | React (JavaScript) | Vite | ✅ | Same integration without TypeScript |
| [`nextjs`](./nextjs) | Next.js (App Router) | Next | ✅ | Client-only dynamic import (`ssr: false`) |
| [`vue`](./vue) | Vue 3 | Vite | ✅ | Composition API, template ref lifecycle |
| [`nuxtjs3`](./nuxtjs3) | Nuxt 3 | Nuxt | ✅ | Client-only component (`.client.vue`) |
| [`sveltekit`](./sveltekit) | SvelteKit | Vite | ✅ | `ssr: false` route + `onMount` |
| [`solidjs-typescript`](./solidjs-typescript) | SolidJS + TypeScript | Vite | ✅ | `onMount` / `onCleanup` lifecycle |
| [`angular`](./angular) | Angular | Angular CLI | ✅ | Standalone component, lifecycle hooks |
| `datafeed-websocket` | — | Vite | ✅ | _planned_ — real-time bars over WebSocket |

Native/backend targets (Android WebView, iOS WKWebView, React Native, Rails) follow the same
"host a page that embeds the SDK" pattern but aren't included yet — see [Roadmap](#roadmap).

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
  symbol: "DEMO:BTCUSD",
  interval: "1D",
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

The bundled `mock-datafeed` generates a synthetic random walk so examples run offline. To use real data, replace it with a datafeed that fetches from your provider. The shape is identical — implement `getBars` and `resolveSymbol` against your API instead of the generator.

For a full production datafeed (Bybit REST + WebSocket, symbol search, marks), see the reference implementation in the GoCharting SDK demo app.

## Roadmap

Planned examples, mirroring the breadth of TradingView's example set:

- **`datafeed-websocket`** — a real-time datafeed over WebSocket (the current examples all
  use the bundled synthetic feed).
- **Native WebView hosts** — `android` (WebView), `ios-swift` (WKWebView), and `react-native`.
  These embed a small HTML page that loads the SDK; the SDK ships `isNativeApp` + a
  bidirectional bridge for host-owned chrome.
- **Backend-rendered** — `ruby-on-rails` (and similar) serving the host page.

The native and backend targets can't be verified in a headless web environment, so they'll
land as reviewed templates rather than browser-tested examples.

## License

[MIT](./LICENSE)
