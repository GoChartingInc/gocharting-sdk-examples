# Angular · GoCharting SDK example

The GoCharting SDK in an Angular standalone component, using the component lifecycle hooks
and the Angular CLI build.

Streams live market data (BYBIT BTCUSDT) over the GoCharting demo WebSocket. Requires network access.

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
- [`src/app/ws-datafeed.ts`](./src/app/ws-datafeed.ts) — WebSocket datafeed (getBars, resolveSymbol, subscribeTicks, searchSymbols). See the [demo-websocket guide](https://gocharting.com/sdk/docs/guides/demo-websocket).

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
			symbol: DEFAULT_SYMBOL,
			interval: "5m",
			datafeed: createWebSocketDatafeed(),
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
