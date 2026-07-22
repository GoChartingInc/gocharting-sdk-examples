import React, { useRef } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";

/**
 * Hosts the GoCharting SDK in a react-native-webview.
 *
 * assets/chart.html runs with `isNativeApp: true`, so the SDK renders the
 * mobile canvas only — this component owns all chrome and receives chart
 * events through onMessage. `window.ReactNativeWebView` is injected by the
 * WebView automatically, which is what the SDK posts to.
 */
export default function App() {
	const webRef = useRef<WebView>(null);

	const onMessage = (event: WebViewMessageEvent) => {
		const msg = JSON.parse(event.nativeEvent.data);
		switch (msg.type) {
			case "OPEN_CONTEXT_MENU":
				// msg has x / y / targetType / objectId — show your own sheet.
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

	// native → web: drive the chart. `window.chart` is exposed by chart.html.
	const setSymbol = (symbol: string) =>
		webRef.current?.injectJavaScript(
			`window.chart && window.chart.setSymbol(${JSON.stringify(symbol)}); true;`,
		);

	const setInterval = (interval: string) =>
		webRef.current?.injectJavaScript(
			`window.chart && window.chart.setInterval(${JSON.stringify(interval)}); true;`,
		);

	// Silence unused warnings in this minimal example — wire these to your UI.
	void setSymbol;
	void setInterval;

	return (
		<SafeAreaView style={styles.container}>
			<WebView
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
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#0d0f14" },
	webview: { flex: 1, backgroundColor: "#0d0f14" },
});
