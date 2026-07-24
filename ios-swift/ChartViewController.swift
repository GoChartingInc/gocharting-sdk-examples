import UIKit
import WebKit

/// Hosts the GoCharting SDK in a WKWebView.
///
/// The chart page (Resources/chart.html) runs with `isNativeApp: true`, so the
/// SDK renders the mobile canvas only — this view controller owns all chrome
/// (toolbars, sheets, order tickets) and receives chart events over the bridge.
final class ChartViewController: UIViewController, WKScriptMessageHandler {

    private var webView: WKWebView!

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = UIColor(red: 0.05, green: 0.06, blue: 0.08, alpha: 1)

        let contentController = WKUserContentController()
        // The SDK posts to window.webkit.messageHandlers.ios
        contentController.add(self, name: "ios")

        let config = WKWebViewConfiguration()
        config.userContentController = contentController
        config.allowsInlineMediaPlayback = true

        webView = WKWebView(frame: .zero, configuration: config)
        webView.scrollView.isScrollEnabled = false
        webView.isOpaque = false
        webView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(webView)

        // Native bottom bar — drives the chart through gcMenu (see chart.html).
        let menuBar = NativeMenuBar(webView: webView, presenter: self)
        menuBar.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(menuBar)

        let guide = view.safeAreaLayoutGuide
        NSLayoutConstraint.activate([
            webView.topAnchor.constraint(equalTo: guide.topAnchor),
            webView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            webView.bottomAnchor.constraint(equalTo: menuBar.topAnchor),

            menuBar.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            menuBar.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            menuBar.bottomAnchor.constraint(equalTo: guide.bottomAnchor),
        ])

        // chart.html and index.umd.js are bundled in Resources/.
        guard let url = Bundle.main.url(forResource: "chart", withExtension: "html") else {
            assertionFailure("chart.html missing from the app bundle")
            return
        }
        // Grant read access to the whole folder so ./index.umd.js resolves.
        webView.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
    }

    deinit {
        webView?.configuration.userContentController
            .removeScriptMessageHandler(forName: "ios")
    }

    // MARK: - web → native

    /// On iOS the SDK posts the object itself (not a JSON string).
    func userContentController(
        _ userContentController: WKUserContentController,
        didReceive message: WKScriptMessage
    ) {
        guard let body = message.body as? [String: Any],
              let type = body["type"] as? String else { return }

        switch type {
        case "OPEN_CONTEXT_MENU":
            openContextMenu(body)
        case "PLACE_ORDER":
            openOrderTicket(body)
        case "DOWNLOAD_MORE_DATA":
            requestMoreBars(body)
        default:
            print("chart event:", type, body)
        }
    }

    // MARK: - Your native chrome

    private func openContextMenu(_ msg: [String: Any]) {
        // msg has x / y / targetType / objectId — present your own sheet.
        print("context menu at", msg["x"] ?? 0, msg["y"] ?? 0)
    }

    private func openOrderTicket(_ msg: [String: Any]) {
        print("place order:", msg)
    }

    private func requestMoreBars(_ msg: [String: Any]) {
        print("download more data:", msg)
    }

    // MARK: - native → web

    /// Drive the chart from your UI. `window.chart` is exposed by chart.html.
    func setSymbol(_ symbol: String) {
        evaluate("window.chart && window.chart.setSymbol(\(jsString(symbol)));")
    }

    func setInterval(_ interval: String) {
        evaluate("window.chart && window.chart.setInterval(\(jsString(interval)));")
    }

    func setTheme(_ theme: String) {
        evaluate("window.chart && window.chart.setTheme(\(jsString(theme)));")
    }

    private func evaluate(_ js: String) {
        webView.evaluateJavaScript(js, completionHandler: nil)
    }

    /// JSON-encode so quotes/backslashes in the value can't break out.
    private func jsString(_ value: String) -> String {
        let data = try? JSONSerialization.data(
            withJSONObject: [value], options: [.fragmentsAllowed]
        )
        if let data, let arr = String(data: data, encoding: .utf8) {
            // strip the surrounding [ ] to get the quoted scalar
            return String(arr.dropFirst().dropLast())
        }
        return "\"\""
    }
}
