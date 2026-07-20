"use client";

import dynamic from "next/dynamic";

// The SDK renders to a browser canvas and must never run during SSR.
// Loading the chart with `ssr: false` keeps it strictly client-side.
const Chart = dynamic(() => import("./Chart"), { ssr: false });

export default function Page() {
	return (
		<div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
			<header
				style={{
					padding: "12px 16px",
					font: "600 14px system-ui, sans-serif",
					color: "#e6e6e6",
					background: "#15171e",
					borderBottom: "1px solid rgba(255,255,255,0.08)",
				}}
			>
				GoCharting SDK · Next.js example
			</header>
			<main style={{ flex: 1, minHeight: 0 }}>
				<Chart />
			</main>
		</div>
	);
}
