package com.gocharting.example

import android.app.Activity
import android.app.AlertDialog
import android.webkit.WebView
import org.json.JSONArray
import org.json.JSONObject

/**
 * Native bottom-bar menus that drive the chart through the page's `gcMenu`
 * bridge (see chart.html). This is the "option 3" integration: the SDK renders
 * the canvas only (`nativeChrome: "none"`) and the host owns every menu.
 *
 * Everything here is plain framework UI (AlertDialog) — no Material dependency.
 * The only JavaScript is a `gcMenu.act(...)` per selection and a
 * `gcMenu.snapshot()` read to fill the dialogs — the same two calls every
 * platform makes, so this mirrors NativeMenuBar.swift with a different list UI.
 */
class NativeMenuBar(
    private val activity: Activity,
    private val webView: WebView,
) {
    /** Wire the four buttons defined in activity_chart.xml. */
    fun attach() {
        activity.findViewById<android.widget.Button>(R.id.btnInterval)
            .setOnClickListener { pickInterval() }
        activity.findViewById<android.widget.Button>(R.id.btnType)
            .setOnClickListener { pickChartType() }
        activity.findViewById<android.widget.Button>(R.id.btnDraw)
            .setOnClickListener { pickDrawing() }
        activity.findViewById<android.widget.Button>(R.id.btnIndicators)
            .setOnClickListener { pickIndicators() }
    }

    // --- reading menu state ------------------------------------------------

    /** Fetch `gcMenu.snapshot()` and hand the parsed object back on the UI thread. */
    private fun snapshot(done: (JSONObject) -> Unit) {
        webView.evaluateJavascript("JSON.stringify(gcMenu.snapshot())") { raw ->
            // evaluateJavascript hands back the value as a JSON string literal
            // (e.g. "\"{...}\""), so unwrap one level before parsing.
            val inner = org.json.JSONTokener(raw).nextValue() as? String ?: return@evaluateJavascript
            activity.runOnUiThread { done(JSONObject(inner)) }
        }
    }

    /** Run a `gcMenu.act(action, arg)` call. `arg` is JSON-quoted so it can't break out. */
    private fun act(action: String, arg: String?) {
        val argJs = if (arg != null) JSONObject.quote(arg) else "undefined"
        webView.evaluateJavascript("gcMenu.act(${JSONObject.quote(action)}, $argJs);", null)
    }

    // --- sheets ------------------------------------------------------------

    private fun sheet(title: String, labels: List<String>, onPick: (Int) -> Unit) {
        AlertDialog.Builder(activity)
            .setTitle(title)
            .setItems(labels.toTypedArray()) { _, which -> onPick(which) }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun pickInterval() = snapshot { snap ->
        val iv = snap.optJSONObject("interval") ?: return@snapshot
        val current = iv.optString("current")
        val options = iv.optJSONArray("options") ?: JSONArray()
        val codes = (0 until options.length()).map { options.getString(it) }
        val labels = codes.map { if (it == current) "$it  ✓" else it }
        sheet("Interval", labels) { i -> act("setInterval", codes[i]) }
    }

    private fun pickChartType() = snapshot { snap ->
        val opts = snap.optJSONObject("chartType")?.optJSONArray("options") ?: JSONArray()
        val codes = (0 until opts.length()).map { opts.getJSONObject(it).getString("code") }
        val labels = (0 until opts.length()).map { opts.getJSONObject(it).getString("label") }
        sheet("Chart type", labels) { i -> act("setChartType", codes[i]) }
    }

    private fun pickDrawing() = snapshot { snap ->
        val tools = snap.optJSONObject("drawings")?.optJSONArray("tools") ?: JSONArray()
        val codes = (0 until tools.length()).map { tools.getJSONObject(it).getString("code") }
        val labels = (0 until tools.length()).map { tools.getJSONObject(it).getString("label") }
            .toMutableList()
        labels.add("Clear all")
        sheet("Drawing tools", labels) { i ->
            if (i < codes.size) act("selectTool", codes[i]) else act("clearDrawings", null)
        }
    }

    private fun pickIndicators() = snapshot { snap ->
        val ind = snap.optJSONObject("indicators") ?: return@snapshot
        val catalog = ind.optJSONArray("catalog") ?: JSONArray()
        val active = ind.optJSONArray("active") ?: JSONArray()
        val activeTypes =
            (0 until active.length()).map { active.getJSONObject(it).getString("type") }.toSet()

        // Group by `groupName` — the field getStudiesCatalog() attaches. The SDK
        // owns the grouping; the host just buckets by it. Entries fall under
        // "Other" only on older bundles that predate the method.
        val groups = sortedMapOf<String, MutableList<JSONObject>>()
        for (j in 0 until catalog.length()) {
            val c = catalog.getJSONObject(j)
            val g = if (c.isNull("groupName")) "Other" else c.optString("groupName", "Other")
            groups.getOrPut(g) { mutableListOf() }.add(c)
        }

        // Active studies first (tap to remove), then one row per group that
        // opens a second dialog of that group's indicators (a list dialog can't
        // render headers, so drill in — same catalog, grouped).
        val labels = mutableListOf<String>()
        val actions = mutableListOf<() -> Unit>()
        for (j in 0 until active.length()) {
            val s = active.getJSONObject(j)
            labels.add("Remove ${s.getString("type")}")
            val id = s.getString("id")
            actions.add { act("removeStudy", id) }
        }
        for ((g, entries) in groups) {
            labels.add("$g ▸")
            actions.add { showGroup(g, entries, activeTypes) }
        }
        sheet("Indicators", labels) { i -> actions[i]() }
    }

    private fun showGroup(group: String, entries: List<JSONObject>, activeTypes: Set<String>) {
        val labels = mutableListOf<String>()
        val actions = mutableListOf<() -> Unit>()
        for (c in entries) {
            val type = c.getString("type")
            if (activeTypes.contains(type)) continue
            labels.add("Add ${c.getString("name")}")
            actions.add { act("addStudy", type) }
        }
        sheet(group, labels) { i -> actions[i]() }
    }
}
