import React, { useState } from "react";
import {
	Modal,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";

/**
 * Native bottom bar driving the chart through the page's `gcMenu` bridge
 * (see assets/chart.html). This is the "option 3" integration: the SDK renders
 * the canvas only (`nativeChrome: "none"`) and the host owns every menu.
 *
 * Reading menu state is the one part that differs from the other platforms:
 * react-native-webview's `injectJavaScript` is fire-and-forget, so
 * `gcMenu.snapshot()` posts its result back over the message channel. App.tsx
 * turns that into a Promise (`requestSnapshot`). Actions still fire-and-forget
 * via `act`. Otherwise this mirrors NativeMenuBar.swift / .kt / .dart.
 */

type Snapshot = {
	interval?: { current?: string; options?: string[] };
	chartType?: { options?: { code: string; label: string }[] };
	drawings?: { tools?: { code: string; label: string }[] };
	indicators?: {
		popular?: { code: string; label: string }[];
		catalog?: { type: string; name: string; groupName: string | null }[];
		active?: { id: string; type: string }[];
	};
};

type SheetItem = {
	label: string;
	active?: boolean;
	header?: boolean;
	onPress?: () => void;
};

export function NativeMenuBar(props: {
	requestSnapshot: () => Promise<Snapshot>;
	act: (action: string, arg?: string) => void;
}) {
	const [sheet, setSheet] = useState<{ title: string; items: SheetItem[] } | null>(
		null,
	);

	const open = (title: string, items: SheetItem[]) => setSheet({ title, items });
	const close = () => setSheet(null);

	const pickInterval = async () => {
		const s = await props.requestSnapshot();
		const iv = s.interval ?? {};
		open(
			"Interval",
			(iv.options ?? []).map((code) => ({
				label: code,
				active: code === iv.current,
				onPress: () => props.act("setInterval", code),
			})),
		);
	};

	const pickChartType = async () => {
		const s = await props.requestSnapshot();
		open(
			"Chart type",
			(s.chartType?.options ?? []).map((o) => ({
				label: o.label,
				onPress: () => props.act("setChartType", o.code),
			})),
		);
	};

	const pickDrawing = async () => {
		const s = await props.requestSnapshot();
		open("Drawing tools", [
			...(s.drawings?.tools ?? []).map((t) => ({
				label: t.label,
				onPress: () => props.act("selectTool", t.code),
			})),
			{ label: "Clear all", onPress: () => props.act("clearDrawings") },
		]);
	};

	const pickIndicators = async () => {
		const s = await props.requestSnapshot();
		const active = s.indicators?.active ?? [];
		const catalog = s.indicators?.catalog ?? [];
		const activeTypes = new Set(active.map((a) => a.type));

		// Group by `groupName` — the field getStudiesCatalog() attaches. The SDK
		// owns the grouping; the host just buckets by it. Entries fall under
		// "Other" only on older bundles that predate the method.
		const groups: Record<string, typeof catalog> = {};
		for (const c of catalog) (groups[c.groupName ?? "Other"] ??= []).push(c);
		const groupNames = Object.keys(groups).sort();

		open("Indicators", [
			// Active first (tap to remove), then each group with its indicators.
			...active.map((a) => ({
				label: `Remove ${a.type}`,
				active: true,
				onPress: () => props.act("removeStudy", a.id),
			})),
			...groupNames.flatMap((g): SheetItem[] => [
				{ label: g, header: true },
				...groups[g]
					.filter((c) => !activeTypes.has(c.type))
					.map((c) => ({
						label: `Add ${c.name}`,
						onPress: () => props.act("addStudy", c.type),
					})),
			]),
		]);
	};

	const Btn = (p: { label: string; onPress: () => void }) => (
		<Pressable style={styles.btn} onPress={p.onPress}>
			<Text style={styles.btnText}>{p.label}</Text>
		</Pressable>
	);

	return (
		<View style={styles.bar}>
			<Btn label="Interval" onPress={pickInterval} />
			<Btn label="Type" onPress={pickChartType} />
			<Btn label="Draw" onPress={pickDrawing} />
			<Btn label="Indicators" onPress={pickIndicators} />

			<Modal
				visible={sheet !== null}
				transparent
				animationType="slide"
				onRequestClose={close}
			>
				<Pressable style={styles.backdrop} onPress={close}>
					<Pressable style={styles.sheet}>
						<Text style={styles.sheetTitle}>{sheet?.title}</Text>
						<ScrollView>
							{sheet?.items.map((it, i) =>
								it.header ? (
									<Text key={i} style={styles.groupHeader}>
										{it.label}
									</Text>
								) : (
									<Pressable
										key={i}
										style={styles.row}
										onPress={() => {
											close();
											it.onPress?.();
										}}
									>
										<Text style={styles.rowText}>{it.label}</Text>
										{it.active ? <Text style={styles.check}>✓</Text> : null}
									</Pressable>
								),
							)}
						</ScrollView>
					</Pressable>
				</Pressable>
			</Modal>
		</View>
	);
}

const BRAND = "#ffaa01";
const INK = "#1a1923";
const SURFACE = "#16181f";

const styles = StyleSheet.create({
	bar: { flexDirection: "row", backgroundColor: BRAND },
	btn: { flex: 1, paddingVertical: 16, alignItems: "center" },
	btnText: { color: INK, fontWeight: "600", fontSize: 14 },
	backdrop: { flex: 1, backgroundColor: "#0008", justifyContent: "flex-end" },
	sheet: {
		backgroundColor: SURFACE,
		borderTopLeftRadius: 12,
		borderTopRightRadius: 12,
		paddingVertical: 8,
		maxHeight: "60%",
	},
	sheetTitle: {
		color: "#9aa0ac",
		fontWeight: "600",
		fontSize: 13,
		paddingHorizontal: 20,
		paddingVertical: 12,
	},
	groupHeader: {
		color: BRAND,
		fontWeight: "700",
		fontSize: 12,
		letterSpacing: 0.5,
		paddingHorizontal: 20,
		paddingTop: 12,
		paddingBottom: 4,
	},
	row: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingHorizontal: 20,
		paddingVertical: 16,
	},
	rowText: { color: "#e8eaed", fontSize: 16 },
	check: { color: BRAND, fontSize: 16 },
});
