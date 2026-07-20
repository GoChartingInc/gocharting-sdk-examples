import { Chart } from "./Chart";

export default function App() {
	return (
		<div style={{ display: "flex", "flex-direction": "column", height: "100vh" }}>
			<header
				style={{
					padding: "12px 16px",
					font: "600 14px system-ui, sans-serif",
					color: "#e6e6e6",
					background: "#15171e",
					"border-bottom": "1px solid rgba(255,255,255,0.08)",
				}}
			>
				GoCharting SDK · SolidJS + TypeScript example
			</header>
			<main style={{ flex: 1, "min-height": 0 }}>
				<Chart />
			</main>
		</div>
	);
}
