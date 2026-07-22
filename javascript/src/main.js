import * as GoChartingSDK from "@gocharting/chart-sdk";
import { createWebSocketDatafeed, DEFAULT_SYMBOL } from "./ws-datafeed.js";

// Demo license key — replace with your own from the GoCharting dashboard.
const LICENSE_KEY = "demo-550e8400-e29b-41d4-a716-446655440000";

const chart = GoChartingSDK.createChart("#chart", {
	symbol: DEFAULT_SYMBOL,
	interval: "5m",
	datafeed: createWebSocketDatafeed(),
	licenseKey: LICENSE_KEY,
	theme: "dark",
});

// Clean up if this module is hot-reloaded during development.
if (import.meta.hot) {
	import.meta.hot.dispose(() => chart.destroy());
}
