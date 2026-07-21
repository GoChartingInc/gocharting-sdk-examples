import * as GoChartingSDK from "@gocharting/chart-sdk";
import { createWebSocketDatafeed, DEFAULT_SYMBOL } from "./ws-datafeed";

// Demo license key — replace with your own from the GoCharting dashboard.
const LICENSE_KEY = "demo-550e8400-e29b-41d4-a716-446655440000";

// Unlike the other examples (synthetic offline feed), this one streams real
// data from the GoCharting demo WebSocket. Requires network access.
const chart = GoChartingSDK.createChart("#chart", {
	symbol: DEFAULT_SYMBOL, // BYBIT:FUTURE:BTCUSDT
	interval: "5m",
	datafeed: createWebSocketDatafeed(),
	licenseKey: LICENSE_KEY,
	theme: "dark",
});

if (import.meta.hot) {
	import.meta.hot.dispose(() => chart.destroy());
}
