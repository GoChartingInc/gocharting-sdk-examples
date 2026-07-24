import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

import 'native_menu_bar.dart';

void main() => runApp(const GoChartingApp());

class GoChartingApp extends StatelessWidget {
  const GoChartingApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      title: 'GoCharting SDK',
      debugShowCheckedModeBanner: false,
      home: ChartScreen(),
    );
  }
}

/// Hosts the GoCharting SDK in a webview_flutter WebView.
///
/// assets/chart.html runs with `isNativeApp: true` and `nativeChrome: "none"`,
/// so the SDK renders the mobile canvas only and this widget builds its own
/// native bottom bar (NativeMenuBar) driving the chart through the `gcMenu`
/// bridge. Chart events arrive on the `Flutter` JavaScript channel.
class ChartScreen extends StatefulWidget {
  const ChartScreen({super.key});

  @override
  State<ChartScreen> createState() => _ChartScreenState();
}

class _ChartScreenState extends State<ChartScreen> {
  late final WebViewController _controller;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFF0D0F14))
      // The channel must be named `Flutter` — the SDK calls
      // window.Flutter.postMessage(...)
      ..addJavaScriptChannel(
        'Flutter',
        onMessageReceived: _onChartEvent,
      )
      ..loadFlutterAsset('assets/chart.html');
  }

  // --- web → native -------------------------------------------------------

  void _onChartEvent(JavaScriptMessage message) {
    final msg = jsonDecode(message.message) as Map<String, dynamic>;
    switch (msg['type']) {
      case 'OPEN_CONTEXT_MENU':
        // msg has x / y / targetType / objectId — show your own sheet.
        debugPrint('context menu at ${msg['x']},${msg['y']}');
        break;
      case 'PLACE_ORDER':
        debugPrint('place order: $msg');
        break;
      case 'DOWNLOAD_MORE_DATA':
        debugPrint('download more data: $msg');
        break;
      default:
        debugPrint('chart event: ${msg['type']}');
    }
  }

  // --- native → web -------------------------------------------------------

  /// Drive the chart from your UI. `window.chart` is exposed by chart.html.
  Future<void> setSymbol(String symbol) => _controller.runJavaScript(
        'window.chart && window.chart.setSymbol(${jsonEncode(symbol)});',
      );

  Future<void> setInterval(String interval) => _controller.runJavaScript(
        'window.chart && window.chart.setInterval(${jsonEncode(interval)});',
      );

  Future<void> setTheme(String theme) => _controller.runJavaScript(
        'window.chart && window.chart.setTheme(${jsonEncode(theme)});',
      );

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0D0F14),
      body: SafeArea(
        bottom: false,
        child: WebViewWidget(controller: _controller),
      ),
      bottomNavigationBar: NativeMenuBar(controller: _controller),
    );
  }
}
