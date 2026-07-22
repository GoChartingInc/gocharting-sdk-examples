# Django · GoCharting SDK example

A Django app that serves the page hosting the GoCharting SDK. Nothing chart-specific
happens server-side — the SDK is a browser library, so Django's job is to render the
container and pass configuration (symbol, interval, license key) into the template.

Streams live market data (BYBIT BTCUSDT) over the GoCharting demo WebSocket. Requires
network access.

## Run it

```bash
python3 -m venv .venv
./.venv/bin/pip install "Django>=4.2"

# copy the licensed SDK bundle into the app's static dir
cp node_modules/@gocharting/chart-sdk/index.umd.js chartapp/static/index.umd.js

./.venv/bin/python manage.py runserver
```

Then open http://localhost:8000.

> `index.umd.js` is the **licensed** product and is gitignored here — never commit it.
> See [Getting the SDK](../README.md#getting-the-sdk).

This is a complete, runnable project (no database, no auth — just `staticfiles` and one
view). To use it in an existing project, copy the `chartapp/` package in, add it to
`INSTALLED_APPS`, and include `chartapp.urls`.

## What to look at

- [`chartapp/views.py`](./chartapp/views.py) — passes `symbol` / `interval` /
  `license_key` to the template (query params override the defaults, e.g.
  `?symbol=BYBIT:FUTURE:ETHUSDT`).
- [`chartapp/templates/chartapp/chart.html`](./chartapp/templates/chartapp/chart.html) —
  the chart container plus the two `<script>` tags, then one `createChart` call.
- [`chartapp/static/ws-datafeed.js`](./chartapp/static/ws-datafeed.js) — the WebSocket
  datafeed as a plain script (no bundler needed).

Keep the real license key in the environment (`GOCHARTING_LICENSE_KEY`) rather than in
the template.

## Related

- [demo-websocket guide](https://gocharting.com/sdk/docs/guides/demo-websocket)
