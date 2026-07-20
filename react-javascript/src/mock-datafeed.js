// A self-contained datafeed that generates a synthetic random walk.
// No network, no API key — swap this out for a real provider once you've
// seen the chart render. The only methods you must implement are getBars
// and resolveSymbol; subscribeTicks/unsubscribeTicks add live updates.

export const SYMBOL = "DEMO:BTCUSD";

function resolutionToMs(resolution) {
	const r = String(resolution);
	const minute = 60_000;
	if (r === "1D" || r === "D") return 1440 * minute;
	if (r === "1W" || r === "W") return 7 * 1440 * minute;
	if (r === "1M" || r === "M") return 30 * 1440 * minute;
	const m = r.match(/^(\d+)\s*([mhH]?)$/);
	if (m) {
		const n = Number(m[1]);
		return (m[2] === "h" || m[2] === "H" ? n * 60 : n) * minute;
	}
	return 1440 * minute; // default: daily
}

function generateBars(from, to, stepMs) {
	const bars = [];
	let price = 60_000;
	for (let t = from; t <= to; t += stepMs) {
		const drift = (Math.random() - 0.5) * price * 0.02;
		const open = price;
		const close = Math.max(1, open + drift);
		const high = Math.max(open, close) * (1 + Math.random() * 0.008);
		const low = Math.min(open, close) * (1 - Math.random() * 0.008);
		const volume = Math.round(50 + Math.random() * 950);
		bars.push({ time: t, open, high, low, close, volume });
		price = close;
	}
	return bars;
}

let lastClose = 60_000;
const tickTimers = new Map();

export function createMockDatafeed() {
	return {
		resolveSymbol(symbolName, onResolve /*, onError */) {
			const info = {
				symbol: "BTCUSD",
				full_name: symbolName,
				ticker: symbolName,
				description: "Synthetic demo instrument",
				exchange: "DEMO",
				type: "crypto",
				quote_currency: "USD",
				session: "24x7",
				timezone: "Etc/UTC",
				has_intraday: true,
				supported_resolutions: ["1", "5", "15", "60", "1D"],
			};
			setTimeout(() => onResolve(info), 0);
		},

		async getBars(_symbolInfo, resolution, periodParams) {
			const stepMs = resolutionToMs(resolution);
			const to = periodParams.to.getTime();
			const from = periodParams.from.getTime();
			const bars = generateBars(from, to, stepMs);
			if (bars.length) lastClose = bars[bars.length - 1].close;
			return { bars };
		},

		subscribeTicks(_symbolInfo, _resolution, onRealtimeCallback, subscriberUID) {
			const timer = setInterval(() => {
				const drift = (Math.random() - 0.5) * lastClose * 0.004;
				lastClose = Math.max(1, lastClose + drift);
				const now = Date.now();
				onRealtimeCallback({
					time: now,
					open: lastClose,
					high: lastClose,
					low: lastClose,
					close: lastClose,
					volume: Math.round(1 + Math.random() * 20),
				});
			}, 1000);
			tickTimers.set(subscriberUID, timer);
		},

		unsubscribeTicks(subscriberUID) {
			const timer = tickTimers.get(subscriberUID);
			if (timer) {
				clearInterval(timer);
				tickTimers.delete(subscriberUID);
			}
		},
	};
}
