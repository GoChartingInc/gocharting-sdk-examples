// GoCharting demo WebSocket datafeed.
// Protocol: https://gocharting.com/sdk/docs/guides/demo-websocket
//
// Connects to a real server: `timeseries` for history, a `trade` channel for
// live ticks, and a REST endpoint for symbol search. The demo is allowlisted
// to two symbols (BYBIT BTCUSDT / ETHUSDT perpetuals) and rate-limited to ~5
// connections per IP.

const DEMO_WS_URL = "wss://gocharting.com/sdk/ws";
const SEARCH_URL = "https://gocharting.com/sdk/instruments/search";

export const DEMO_SYMBOLS = [
	{
		key: "BYBIT:FUTURE:BTCUSDT",
		exchange: "BYBIT",
		segment: "FUTURE",
		symbol: "BTCUSDT",
		description: "Bybit BTC/USDT perpetual",
		tick_size: 0.1,
		max_tick_precision: 1,
	},
	{
		key: "BYBIT:FUTURE:ETHUSDT",
		exchange: "BYBIT",
		segment: "FUTURE",
		symbol: "ETHUSDT",
		description: "Bybit ETH/USDT perpetual",
		tick_size: 0.01,
		max_tick_precision: 2,
	},
];

export const DEFAULT_SYMBOL = "BYBIT:FUTURE:BTCUSDT";

function toIntervalString(resolution) {
	if (resolution == null) return "5m";
	if (typeof resolution === "string") return resolution;
	if (resolution.type) return resolution.type;
	if (resolution.baseType) return resolution.baseType;
	if (resolution.scale === "minutes") return `${resolution.units || 1}m`;
	if (resolution.scale === "hours") return resolution.units === 1 ? "1h" : `${resolution.units}h`;
	if (resolution.scale === "days") return "1D";
	if (resolution.scale === "weeks") return "1W";
	if (resolution.scale === "months") return "1M";
	return "5m";
}

function fullSymbolKey(symbolInfoOrName) {
	if (typeof symbolInfoOrName === "string") {
		const found = DEMO_SYMBOLS.find(
			(s) =>
				s.key === symbolInfoOrName ||
				s.symbol === symbolInfoOrName ||
				symbolInfoOrName.endsWith(":" + s.symbol),
		);
		return found ? found.key : symbolInfoOrName;
	}
	if (symbolInfoOrName?.full_name) return symbolInfoOrName.full_name;
	return symbolInfoOrName?.symbol || DEFAULT_SYMBOL;
}

function parseBarTime(dateStr) {
	// Demo server dates are often "YYYY-MM-DDTHH:mm:ss" without Z — treat as UTC.
	const raw = String(dateStr);
	const iso = /Z$|[+-]\d{2}:\d{2}$/.test(raw) ? raw : raw + "Z";
	return Math.floor(new Date(iso).valueOf() / 1000);
}

function flattenTimeseriesBars(payloadBars) {
	const out = [];
	const push = (b) =>
		out.push({
			time: parseBarTime(b.date),
			open: Number(b.open),
			high: Number(b.high),
			low: Number(b.low),
			close: Number(b.close),
			volume: Number(b.volume ?? 0),
		});
	if (Array.isArray(payloadBars)) {
		payloadBars.forEach(push);
	} else if (payloadBars && typeof payloadBars === "object") {
		for (const day of Object.keys(payloadBars)) {
			(payloadBars[day] || []).forEach(push);
		}
	}
	out.sort((a, b) => a.time - b.time);
	return out;
}

// UDF shape — the SDK's DataProvider multiplies `t` by 1000, so return unix
// seconds here (not a { bars } array with ms timestamps).
function barsToUDF(rawBars) {
	if (!rawBars.length) return { s: "no_data", nextTime: null };
	return {
		s: "ok",
		t: rawBars.map((b) => b.time),
		o: rawBars.map((b) => b.open),
		h: rawBars.map((b) => b.high),
		l: rawBars.map((b) => b.low),
		c: rawBars.map((b) => b.close),
		v: rawBars.map((b) => b.volume || 0),
	};
}

export function createWebSocketDatafeed() {
	let ws = null;
	let ready = null;
	let reqId = 1;
	let pingTimer = null;
	const pending = new Map();
	const tickSubs = new Map();
	let searchController = null;

	function ensureWs() {
		if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
			return ready;
		}
		ready = new Promise((resolve, reject) => {
			const socket = new WebSocket(DEMO_WS_URL);
			ws = socket;
			let opened = false;

			socket.onopen = () => {
				opened = true;
				socket.send("PING");
				if (pingTimer) clearInterval(pingTimer);
				pingTimer = setInterval(() => {
					if (socket.readyState === WebSocket.OPEN) socket.send("PING");
				}, 20000);
				resolve(socket);
			};
			socket.onerror = () => {
				if (!opened) reject(new Error("Demo WebSocket connection failed"));
			};
			socket.onclose = () => {
				if (pingTimer) clearInterval(pingTimer);
				pingTimer = null;
				ws = null;
				ready = null;
			};
			socket.onmessage = (ev) => handleMessage(ev);
		});
		return ready;
	}

	function handleMessage(ev) {
		if (typeof ev.data !== "string") return;
		if (ev.data.startsWith("Welcome-") || ev.data.startsWith("PONG")) return;

		let msg;
		try {
			msg = JSON.parse(ev.data);
		} catch {
			return;
		}

		if (msg.command === "ERROR") {
			const p = msg.request_id != null ? pending.get(msg.request_id) : null;
			const err = new Error(msg.message || msg.out?.message || "Demo WebSocket ERROR");
			if (p) {
				clearTimeout(p.timer);
				pending.delete(msg.request_id);
				p.reject(err);
			} else {
				console.warn("[ws-datafeed]", err.message, msg);
			}
			return;
		}

		if (msg.command === "timeseries") {
			const p = pending.get(msg.request_id);
			if (!p) return;
			p.chunks.push(...flattenTimeseriesBars(msg.payload?.bars));
			if (msg.final === 1 || msg.final === 2) {
				clearTimeout(p.timer);
				pending.delete(msg.request_id);
				const byTime = new Map();
				for (const b of p.chunks) byTime.set(b.time, b);
				p.resolve([...byTime.values()].sort((a, b) => a.time - b.time));
			}
			return;
		}

		if (
			msg.channel === "trade" &&
			msg.payload &&
			!Array.isArray(msg.payload) &&
			typeof msg.payload === "object" &&
			msg.command !== "SUBSCRIBE" &&
			msg.command !== "UNSUBSCRIBE"
		) {
			for (const [symbolKey, trades] of Object.entries(msg.payload)) {
				if (!Array.isArray(trades)) continue;
				for (const sub of tickSubs.values()) {
					if (sub.symbolKey !== symbolKey) continue;
					for (const t of trades) {
						if (!t || t.ltp == null) continue;
						const price = Number(t.ltp);
						if (!Number.isFinite(price)) continue;
						const qty = Number(t.l_sz ?? t.sz ?? 0);
						const ts = t.date
							? new Date(t.date)
							: t.t_ms != null
								? new Date(Number(t.t_ms))
								: new Date();
						if (Number.isNaN(ts.getTime())) continue;
						const parts = symbolKey.split(":");
						sub.callback({
							type: "trade",
							productId: symbolKey,
							symbol: parts[2] || symbolKey,
							exchange: parts[0] || "BYBIT",
							segment: parts[1] || "FUTURE",
							timeStamp: ts,
							tradeID: String(t.id ?? t.t_ms ?? Date.now()),
							price,
							quantity: qty,
							amount: price * qty,
							side: String(t.side || "Buy").toUpperCase(),
						});
					}
				}
			}
		}
	}

	return {
		async getBars(symbolInfo, resolution, periodParams) {
			const socket = await ensureWs();
			const symbol = fullSymbolKey(symbolInfo);
			const interval = toIntervalString(resolution);
			const rows = periodParams?.countBack || periodParams?.rows || 300;
			const request_id = reqId++;

			const bars = await new Promise((resolve, reject) => {
				const timer = setTimeout(() => {
					pending.delete(request_id);
					reject(new Error(`timeseries timeout for ${symbol} ${interval}`));
				}, 20000);
				pending.set(request_id, { chunks: [], resolve, reject, timer });
				socket.send(
					JSON.stringify({
						request_id,
						command: "timeseries",
						payload: { symbol, interval, session: "RTH", hint: `rows=${rows}` },
					}),
				);
			});

			const toSec = (v) =>
				v instanceof Date
					? Math.floor(v.getTime() / 1000)
					: Number(v) > 1e12
						? Math.floor(Number(v) / 1000)
						: Number(v);
			const from = periodParams?.from != null ? toSec(periodParams.from) : null;
			const to = periodParams?.to != null ? toSec(periodParams.to) : null;
			const filtered =
				from != null && to != null && Number.isFinite(from) && Number.isFinite(to)
					? bars.filter((b) => b.time >= from && b.time <= to)
					: bars;
			return barsToUDF(filtered.length ? filtered : bars);
		},

		resolveSymbol(symbolName, onResolve, onError) {
			const key = fullSymbolKey(symbolName);
			const meta = DEMO_SYMBOLS.find((s) => s.key === key);
			if (!meta) {
				onError?.(`Demo feed only supports: ${DEMO_SYMBOLS.map((s) => s.key).join(", ")}`);
				return;
			}
			onResolve({
				exchange: meta.exchange,
				// `segment` is required: the SDK rebuilds the exchange:segment:symbol
				// key from these fields, and omitting it yields "BYBIT:undefined:…"
				// which the server won't answer.
				segment: meta.segment,
				symbol: meta.symbol,
				ticker: meta.symbol,
				full_name: meta.key,
				name: meta.description,
				description: meta.description,
				type: "crypto",
				asset_type: "CRYPTO",
				session: "24x7",
				timezone: "Etc/UTC",
				has_intraday: true,
				quote_currency: "USDT",
				tick_size: meta.tick_size,
				max_tick_precision: meta.max_tick_precision,
				data_status: "streaming",
				supported_resolutions: ["1m", "5m", "15m", "1h", "4h", "1D"],
			});
		},

		subscribeTicks(_symbolInfo, _resolution, onRealtimeCallback, subscriberUID) {
			const symbolKey = fullSymbolKey(_symbolInfo);
			tickSubs.set(subscriberUID, { symbolKey, callback: onRealtimeCallback });
			ensureWs().then((socket) =>
				socket.send(
					JSON.stringify({ command: "SUBSCRIBE", channel: "trade", payload: [symbolKey] }),
				),
			);
		},

		unsubscribeTicks(subscriberUID) {
			const sub = tickSubs.get(subscriberUID);
			tickSubs.delete(subscriberUID);
			if (!sub || !ws || ws.readyState !== WebSocket.OPEN) return;
			const stillNeeded = [...tickSubs.values()].some((s) => s.symbolKey === sub.symbolKey);
			if (!stillNeeded) {
				ws.send(
					JSON.stringify({ command: "UNSUBSCRIBE", channel: "trade", payload: [sub.symbolKey] }),
				);
			}
		},

		searchSymbols(userInput, _exchange, _symbolType, onResult) {
			(async () => {
				try {
					if (searchController) searchController.abort();
					searchController = new AbortController();
					const url = new URL(SEARCH_URL);
					url.searchParams.set("q", userInput);
					const res = await fetch(url, { signal: searchController.signal });
					if (!res.ok) throw new Error(`HTTP ${res.status}`);
					const data = await res.json();
					const items = [];
					if (data.status === 200 && data.payload?.results) {
						for (const result of data.payload.results) {
							const collect = (item) => {
								const segment = item.segment || "FUTURE";
								const key = `${item.exchange}:${segment}:${item.symbol}`;
								items.push({
									symbol: item.symbol,
									key,
									full_name: key,
									description: item.name,
									exchange: item.exchange,
									segment,
									type: String(item.asset_type || "crypto").toLowerCase(),
									ticker: item.symbol,
								});
							};
							if (result.item.is_group && result.item.members) {
								result.item.members.forEach((m) => collect(m.item));
							} else {
								collect(result.item);
							}
						}
					}
					onResult({ searchInProgress: false, items });
				} catch (err) {
					if (err?.name === "AbortError") return;
					onResult({ searchInProgress: false, items: [] });
				}
			})();
		},
	};
}
