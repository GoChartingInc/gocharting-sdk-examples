# Angular · GoCharting SDK example

The GoCharting SDK in an Angular standalone component, using the component lifecycle hooks
and the Angular CLI build.

Runs fully offline against a synthetic datafeed — no backend or API key required.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:4200.

> `@gocharting/chart-sdk` is a **licensed package**, not on public npm. You need
> registry access (via a license) to install it — see [Getting the SDK](../README.md#getting-the-sdk)
> in the root README, which also covers evaluating against a local build.

## What to look at

- [`src/app/chart.component.ts`](./src/app/chart.component.ts) — the integration:
  `createChart` in `ngAfterViewInit` (the container `@ViewChild` is available by then),
  torn down with `chart.destroy()` in `ngOnDestroy`.
- [`src/app/mock-datafeed.ts`](./src/app/mock-datafeed.ts) — synthetic datafeed; swap for your own provider.

## The integration in full

```ts
@Component({
	selector: "app-chart",
	standalone: true,
	template: `<div #container style="width: 100%; height: 100%"></div>`,
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
			licenseKey: "YOUR_LICENSE_KEY",
			theme: "dark",
		});
	}

	ngOnDestroy(): void {
		this.chart?.destroy();
		this.chart = null;
	}
}
```
