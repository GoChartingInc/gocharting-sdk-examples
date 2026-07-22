package com.gocharting.example

import android.annotation.SuppressLint
import android.app.Activity
import android.os.Bundle
import android.webkit.JavascriptInterface
import android.webkit.WebView
import org.json.JSONObject

/**
 * Hosts the GoCharting SDK in a WebView.
 *
 * The chart page (assets/chart.html) runs with `isNativeApp: true`, so the SDK
 * renders the mobile canvas only — this Activity owns all chrome (toolbars,
 * sheets, order tickets) and receives chart events over the bridge.
 */
class ChartActivity : Activity() {

    private lateinit var webView: WebView

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_chart)

        webView = findViewById(R.id.chartWebView)
        webView.settings.javaScriptEnabled = true
        webView.settings.domStorageEnabled = true

        // The SDK looks for a global named `Android` with postMessage(String).
        webView.addJavascriptInterface(ChartBridge(), "Android")

        // chart.html and index.umd.js live in app/src/main/assets/
        webView.loadUrl("file:///android_asset/chart.html")
    }

    override fun onDestroy() {
        webView.destroy()
        super.onDestroy()
    }

    /** web → native. Every TerminalMobile appCallback arrives here as JSON. */
    inner class ChartBridge {
        @JavascriptInterface
        fun postMessage(payload: String) {
            val msg = JSONObject(payload)
            when (msg.optString("type")) {
                "OPEN_CONTEXT_MENU" -> runOnUiThread { openContextMenu(msg) }
                "PLACE_ORDER" -> runOnUiThread { openOrderTicket(msg) }
                "DOWNLOAD_MORE_DATA" -> runOnUiThread { requestMoreBars(msg) }
                else -> android.util.Log.d("GoCharting", "chart event: $msg")
            }
        }
    }

    // --- Your native chrome ------------------------------------------------

    private fun openContextMenu(msg: JSONObject) {
        // msg has x / y / targetType / objectId — show your own action sheet.
        android.util.Log.d("GoCharting", "context menu at ${msg.optInt("x")},${msg.optInt("y")}")
    }

    private fun openOrderTicket(msg: JSONObject) {
        android.util.Log.d("GoCharting", "place order: $msg")
    }

    private fun requestMoreBars(msg: JSONObject) {
        android.util.Log.d("GoCharting", "download more data: $msg")
    }

    // --- native → web ------------------------------------------------------

    /** Drive the chart from your UI. `window.chart` is exposed by chart.html. */
    fun setSymbol(symbol: String) {
        val escaped = JSONObject.quote(symbol)
        webView.evaluateJavascript("window.chart && window.chart.setSymbol($escaped);", null)
    }

    fun setInterval(interval: String) {
        val escaped = JSONObject.quote(interval)
        webView.evaluateJavascript("window.chart && window.chart.setInterval($escaped);", null)
    }

    fun setTheme(theme: String) {
        val escaped = JSONObject.quote(theme)
        webView.evaluateJavascript("window.chart && window.chart.setTheme($escaped);", null)
    }
}
