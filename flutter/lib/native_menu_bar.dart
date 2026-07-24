import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

/// Native bottom bar that drives the chart through the page's `gcMenu` bridge
/// (see assets/chart.html). This is the "option 3" integration: the SDK renders
/// the canvas only (`nativeChrome: "none"`) and the host owns every menu.
///
/// The only JavaScript is a `gcMenu.act(...)` per selection and a
/// `gcMenu.snapshot()` read to fill the sheets — the same two calls every
/// platform makes, so this mirrors NativeMenuBar.swift / .kt with Flutter
/// widgets for the list UI.
class NativeMenuBar extends StatelessWidget {
  const NativeMenuBar({super.key, required this.controller});

  final WebViewController controller;

  static const _brand = Color(0xFFFFAA01);
  static const _ink = Color(0xFF1A1923);
  static const _surface = Color(0xFF16181F);

  // --- reading menu state ---------------------------------------------------

  /// Fetch `gcMenu.snapshot()` and decode it. `runJavaScriptReturningResult`
  /// hands strings back differently per platform (raw vs JSON-wrapped), so
  /// decode until we reach the object.
  Future<Map<String, dynamic>> _snapshot() async {
    final raw =
        await controller.runJavaScriptReturningResult('JSON.stringify(gcMenu.snapshot())');
    dynamic value = raw is String ? raw : raw.toString();
    value = jsonDecode(value as String);
    if (value is String) value = jsonDecode(value);
    return (value as Map).cast<String, dynamic>();
  }

  /// Run `gcMenu.act(action, arg)`. `arg` is JSON-encoded so it can't break out.
  Future<void> _act(String action, [String? arg]) {
    final argJs = arg == null ? 'undefined' : jsonEncode(arg);
    return controller.runJavaScript('gcMenu.act(${jsonEncode(action)}, $argJs);');
  }

  // --- sheets ---------------------------------------------------------------

  Future<void> _sheet(BuildContext context, String title, List<_MenuItem> items) {
    return showModalBottomSheet<void>(
      context: context,
      backgroundColor: _surface,
      builder: (ctx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Text(title,
                    style: const TextStyle(
                        color: Colors.white70, fontWeight: FontWeight.w600, fontSize: 13)),
              ),
            ),
            for (final it in items)
              ListTile(
                title: Text(it.label, style: const TextStyle(color: Colors.white)),
                trailing: it.active
                    ? const Icon(Icons.check, color: _brand, size: 18)
                    : null,
                onTap: () {
                  Navigator.pop(ctx);
                  it.onTap();
                },
              ),
          ],
        ),
      ),
    );
  }

  Future<void> _pickInterval(BuildContext context) async {
    final snap = await _snapshot();
    final iv = snap['interval'] as Map<String, dynamic>? ?? {};
    final current = iv['current'] as String?;
    final options = (iv['options'] as List?)?.cast<String>() ?? const [];
    if (!context.mounted) return;
    await _sheet(context, 'Interval', [
      for (final code in options)
        _MenuItem(code, active: code == current, onTap: () => _act('setInterval', code)),
    ]);
  }

  Future<void> _pickChartType(BuildContext context) async {
    final snap = await _snapshot();
    final opts = ((snap['chartType'] as Map?)?['options'] as List?)
            ?.cast<Map<String, dynamic>>() ??
        const [];
    if (!context.mounted) return;
    await _sheet(context, 'Chart type', [
      for (final o in opts)
        _MenuItem(o['label'] as String, onTap: () => _act('setChartType', o['code'] as String)),
    ]);
  }

  Future<void> _pickDrawing(BuildContext context) async {
    final snap = await _snapshot();
    final tools = ((snap['drawings'] as Map?)?['tools'] as List?)
            ?.cast<Map<String, dynamic>>() ??
        const [];
    if (!context.mounted) return;
    await _sheet(context, 'Drawing tools', [
      for (final t in tools)
        _MenuItem(t['label'] as String, onTap: () => _act('selectTool', t['code'] as String)),
      _MenuItem('Clear all', onTap: () => _act('clearDrawings')),
    ]);
  }

  Future<void> _pickIndicators(BuildContext context) async {
    final snap = await _snapshot();
    final ind = snap['indicators'] as Map<String, dynamic>? ?? {};
    final popular = (ind['popular'] as List?)?.cast<Map<String, dynamic>>() ?? const [];
    final active = (ind['active'] as List?)?.cast<Map<String, dynamic>>() ?? const [];
    final activeTypes = active.map((s) => s['type'] as String).toSet();
    if (!context.mounted) return;
    await _sheet(context, 'Indicators', [
      // active first (tap to remove), then popular not-yet-added (tap to add)
      for (final s in active)
        _MenuItem('Remove ${s['type']}',
            active: true, onTap: () => _act('removeStudy', s['id'] as String)),
      for (final p in popular)
        if (!activeTypes.contains(p['code'] as String))
          _MenuItem('Add ${p['label']}', onTap: () => _act('addStudy', p['code'] as String)),
    ]);
  }

  // --- bar ------------------------------------------------------------------

  @override
  Widget build(BuildContext context) {
    Widget button(String label, Future<void> Function(BuildContext) onTap) => Expanded(
          child: TextButton(
            onPressed: () => onTap(context),
            child: Text(label,
                style: const TextStyle(
                    color: _ink, fontWeight: FontWeight.w600, fontSize: 14)),
          ),
        );
    return BottomAppBar(
      color: _brand,
      padding: EdgeInsets.zero,
      height: 56,
      child: Row(children: [
        button('Interval', _pickInterval),
        button('Type', _pickChartType),
        button('Draw', _pickDrawing),
        button('Indicators', _pickIndicators),
      ]),
    );
  }
}

class _MenuItem {
  _MenuItem(this.label, {this.active = false, required this.onTap});
  final String label;
  final bool active;
  final VoidCallback onTap;
}
