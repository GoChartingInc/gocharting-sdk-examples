# Ruby on Rails · GoCharting SDK example

A Rails controller + view that serve the page hosting the GoCharting SDK. Nothing
chart-specific happens server-side — the SDK is a browser library, so Rails' job is to
render the container and pass configuration (symbol, interval, license key) into the view.

Streams live market data (BYBIT BTCUSDT) over the GoCharting demo WebSocket. Requires
network access.

## Setup

This example ships the integration files only. Drop them into a Rails app:

```bash
rails new gocharting-demo
cd gocharting-demo

# copy the integration files in
cp -r ../ruby-on-rails/app/controllers/charts_controller.rb app/controllers/
cp -r ../ruby-on-rails/app/views/charts                     app/views/
cp    ../ruby-on-rails/public/ws-datafeed.js                public/

# merge the route into your config/routes.rb
#   get "chart", to: "charts#show", as: :chart
#   root "charts#show"

# copy the licensed SDK bundle so it is served as a static asset
cp node_modules/@gocharting/chart-sdk/index.umd.js public/index.umd.js

bin/rails server
```

Then open http://localhost:3000.

> `index.umd.js` is the **licensed** product and is gitignored here — never commit it.
> See [Getting the SDK](../README.md#getting-the-sdk).

## What to look at

- [`app/controllers/charts_controller.rb`](./app/controllers/charts_controller.rb) —
  resolves `symbol` / `interval` / `license_key` (query params override the defaults,
  e.g. `?symbol=BYBIT:FUTURE:ETHUSDT`).
- [`app/views/charts/show.html.erb`](./app/views/charts/show.html.erb) — the chart
  container plus the two script tags, then one `createChart` call. Values are
  interpolated with `to_json` so they're safely escaped into JavaScript.
- [`public/ws-datafeed.js`](./public/ws-datafeed.js) — the WebSocket datafeed as a plain
  script (no bundler needed).

Keep the real license key in credentials or `ENV["GOCHARTING_LICENSE_KEY"]` rather than
in the view.

## Related

- [demo-websocket guide](https://gocharting.com/sdk/docs/guides/demo-websocket)
