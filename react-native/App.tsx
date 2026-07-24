import React, { useRef } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";

import { NativeMenuBar } from "./NativeMenuBar";

/**
 * Hosts the GoCharting SDK in a react-native-webview.
 *
 * assets/chart.html runs with `isNativeApp: true` and `nativeChrome: "none"`,
 * so the SDK renders the mobile canvas only and this component builds its own
 * native bottom bar (NativeMenuBar) driving the chart through the `gcMenu`
 * bridge. Chart events arrive through onMessage; `window.ReactNativeWebView`
 * is injected by the WebView automatically, which is what the SDK posts to.
 */
// react-native-webview declares `class WebView<P = undefined>` extending
// `Component<WebViewProps & P>`. With the default generic that intersects to
// `never`, so every prop is rejected — pass `object` explicitly instead.
type ChartWebView = WebView<object>;

export default function App() {
	const webRef = useRef<ChartWebView>(null);
	// Pending resolver for the current gcMenu.snapshot() round-trip.
	const pendingSnapshot = useRef<((snap: unknown) => void) | null>(null);

	const onMessage = (event: WebViewMessageEvent) => {
		const msg = JSON.parse(event.nativeEvent.data);
		// gcMenu.snapshot() posts its result back here (injectJavaScript can't
		// return a value), so resolve the waiting requestSnapshot() Promise.
		if (msg && msg.__gcSnapshot !== undefined) {
			pendingSnapshot.current?.(msg.__gcSnapshot);
			pendingSnapshot.current = null;
			return;
		}
		switch (msg.type) {
			case "OPEN_CONTEXT_MENU":
				console.log("context menu at", msg.x, msg.y);
				break;
			case "PLACE_ORDER":
				console.log("place order", msg);
				break;
			case "DOWNLOAD_MORE_DATA":
				console.log("download more data", msg);
				break;
			default:
				console.log("chart event", msg.type, msg);
		}
	};

	// Ask the page for gcMenu.snapshot() and resolve when it posts back.
	const requestSnapshot = () =>
		new Promise<any>((resolve) => {
			pendingSnapshot.current = resolve;
			webRef.current?.injectJavaScript(
				"window.ReactNativeWebView.postMessage(JSON.stringify({ __gcSnapshot: gcMenu.snapshot() })); true;",
			);
		});

	// Fire a gcMenu action. `arg` is JSON-encoded so it can't break out.
	const act = (action: string, arg?: string) => {
		const argJs = arg === undefined ? "undefined" : JSON.stringify(arg);
		webRef.current?.injectJavaScript(
			`gcMenu.act(${JSON.stringify(action)}, ${argJs}); true;`,
		);
	};

	return (
		<SafeAreaView style={styles.container}>
			<WebView<object>
				ref={webRef}
				source={require("./assets/chart.html")}
				originWhitelist={["*"]}
				onMessage={onMessage}
				javaScriptEnabled
				domStorageEnabled
				allowFileAccess
				allowFileAccessFromFileURLs
				allowUniversalAccessFromFileURLs
				style={styles.webview}
			/>
			<NativeMenuBar requestSnapshot={requestSnapshot} act={act} />
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#0d0f14" },
	webview: { flex: 1, backgroundColor: "#0d0f14" },
});
