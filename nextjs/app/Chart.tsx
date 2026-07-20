"use client";

import { useEffect, useRef } from "react";
import * as GoChartingSDK from "@gocharting/chart-sdk";
import type { ChartWrapper } from "@gocharting/chart-sdk";
import { createMockDatafeed, SYMBOL } from "../lib/mock-datafeed";

// Demo license key — replace with your own from the GoCharting dashboard.
const LICENSE_KEY = "demo-550e8400-e29b-41d4-a716-446655440000";

export default function Chart() {
	const containerRef = useRef<HTMLDivElement>(null);
	const chartRef = useRef<ChartWrapper | null>(null);

	useEffect(() => {
		if (!containerRef.current) return;

		const chart = GoChartingSDK.createChart(containerRef.current, {
			symbol: SYMBOL,
			interval: "1D",
			datafeed: createMockDatafeed(),
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
