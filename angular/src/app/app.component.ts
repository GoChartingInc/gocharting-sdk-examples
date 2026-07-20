import { Component } from "@angular/core";
import { ChartComponent } from "./chart.component";

@Component({
	selector: "app-root",
	standalone: true,
	imports: [ChartComponent],
	template: `
		<div class="app">
			<header class="app-header">GoCharting SDK · Angular example</header>
			<main class="app-main">
				<app-chart></app-chart>
			</main>
		</div>
	`,
	styles: [
		`
			.app {
				display: flex;
				flex-direction: column;
				height: 100vh;
			}
			.app-header {
				padding: 12px 16px;
				font: 600 14px system-ui, sans-serif;
				color: #e6e6e6;
				background: #15171e;
				border-bottom: 1px solid rgba(255, 255, 255, 0.08);
			}
			.app-main {
				flex: 1;
				min-height: 0;
			}
		`,
	],
})
export class AppComponent {}
