import {
	Component,
	ElementRef,
	AfterViewInit,
	OnDestroy,
	ViewChild,
} from "@angular/core";
import * as GoChartingSDK from "@gocharting/chart-sdk";
import type { ChartWrapper } from "@gocharting/chart-sdk";
import { createMockDatafeed, SYMBOL } from "./mock-datafeed";

// Demo license key — replace with your own from the GoCharting dashboard.
const LICENSE_KEY = "demo-550e8400-e29b-41d4-a716-446655440000";

@Component({
	selector: "app-chart",
	standalone: true,
	template: `<div #container style="width: 100%; height: 100%"></div>`,
	styles: [":host { display: block; width: 100%; height: 100%; }"],
})
export class ChartComponent implements AfterViewInit, OnDestroy {
	@ViewChild("container", { static: true })
	container!: ElementRef<HTMLDivElement>;

	private chart: ChartWrapper | null = null;

	ngAfterViewInit(): void {
		this.chart = GoChartingSDK.createChart(this.container.nativeElement, {
			symbol: SYMBOL,
			interval: "1D",
			datafeed: createMockDatafeed(),
			licenseKey: LICENSE_KEY,
			theme: "dark",
		});
	}

	ngOnDestroy(): void {
		this.chart?.destroy();
		this.chart = null;
	}
}
