import { useEffect, useRef } from "react";
import * as GoChartingSDK from "@gocharting/chart-sdk";
import { createWebSocketDatafeed, DEFAULT_SYMBOL } from "./ws-datafeed.js";

// Demo license key — replace with your own from the GoCharting dashboard.
const LICENSE_KEY = "demo-550e8400-e29b-41d4-a716-446655440000";

export function Chart() {
	const containerRef = useRef(null);
	const chartRef = useRef(null);

	useEffect(() => {
		if (!containerRef.current) return;
		const chart = GoChartingSDK.createChart(containerRef.current, {
			symbol: DEFAULT_SYMBOL,
			interval: "5m",
			datafeed: createWebSocketDatafeed(),
			licenseKey: LICENSE_KEY,
			theme: "dark",
		});
		chartRef.current = chart;
		return () => {
			chartRef.current?.destroy();
			chartRef.current = null;
		};
	}, []);

	return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
