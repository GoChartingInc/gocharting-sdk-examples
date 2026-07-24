import UIKit
import WebKit

/// A native bottom toolbar that drives the chart through the page's `gcMenu`
/// bridge (see chart.html). This is the "option 3" integration: the SDK renders
/// the canvas only (`nativeChrome: "none"`) and the host owns every menu.
///
/// Every control here is native UIKit. The only JavaScript is a `gcMenu.act(...)`
/// call per selection and a `gcMenu.snapshot()` read to populate the sheets —
/// the same two calls every platform makes, so this file is the reference the
/// Android / Flutter / React Native menus mirror.
final class NativeMenuBar: UIToolbar {

    private weak var webView: WKWebView?
    /// Presents the action sheets — the hosting view controller.
    private weak var presenter: UIViewController?

    init(webView: WKWebView, presenter: UIViewController) {
        self.webView = webView
        self.presenter = presenter
        super.init(frame: .zero)
        barTintColor = UIColor(red: 1.0, green: 0.667, blue: 0.004, alpha: 1) // brand #ffaa01
        tintColor = UIColor(red: 0.10, green: 0.098, blue: 0.137, alpha: 1)   // ink #1a1923
        isTranslucent = false
        setItems(
            [
                item("Interval", #selector(pickInterval)),
                .flexibleSpace(),
                item("Type", #selector(pickChartType)),
                .flexibleSpace(),
                item("Draw", #selector(pickDrawing)),
                .flexibleSpace(),
                item("Indicators", #selector(pickIndicators)),
            ],
            animated: false
        )
    }

    required init?(coder: NSCoder) { fatalError("init(coder:) not used") }

    private func item(_ title: String, _ action: Selector) -> UIBarButtonItem {
        let b = UIBarButtonItem(title: title, style: .plain, target: self, action: action)
        b.setTitleTextAttributes([.font: UIFont.systemFont(ofSize: 15, weight: .semibold)], for: .normal)
        return b
    }

    // MARK: - Reading menu state from the page

    /// Fetch `gcMenu.snapshot()` and hand the parsed dictionary back on the main thread.
    private func snapshot(_ done: @escaping ([String: Any]) -> Void) {
        webView?.evaluateJavaScript("JSON.stringify(gcMenu.snapshot())") { result, _ in
            guard let s = result as? String, let data = s.data(using: .utf8),
                  let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any]
            else { return }
            done(obj)
        }
    }

    /// Run a `gcMenu.act(action, arg)` call. `arg` is JSON-encoded so it can't break out.
    private func act(_ action: String, _ arg: String?) {
        let argJS: String
        if let arg, let d = try? JSONSerialization.data(withJSONObject: [arg], options: [.fragmentsAllowed]),
           let s = String(data: d, encoding: .utf8) {
            argJS = String(s.dropFirst().dropLast())
        } else {
            argJS = "undefined"
        }
        webView?.evaluateJavaScript("gcMenu.act(\"\(action)\", \(argJS));")
    }

    // MARK: - Sheets

    private func sheet(_ title: String, _ options: [(label: String, handler: () -> Void)],
                       source: UIBarButtonItem? = nil) {
        let ac = UIAlertController(title: title, message: nil, preferredStyle: .actionSheet)
        for o in options {
            ac.addAction(UIAlertAction(title: o.label, style: .default) { _ in o.handler() })
        }
        ac.addAction(UIAlertAction(title: "Cancel", style: .cancel))
        // iPad requires a popover anchor.
        ac.popoverPresentationController?.barButtonItem = source ?? items?.first
        presenter?.present(ac, animated: true)
    }

    @objc private func pickInterval(_ sender: UIBarButtonItem) {
        snapshot { snap in
            let iv = snap["interval"] as? [String: Any]
            let current = iv?["current"] as? String
            let options = (iv?["options"] as? [String]) ?? []
            self.sheet("Interval", options.map { code in
                (label: code == current ? "\(code)  ✓" : code, handler: { self.act("setInterval", code) })
            }, source: sender)
        }
    }

    @objc private func pickChartType(_ sender: UIBarButtonItem) {
        snapshot { snap in
            let ct = snap["chartType"] as? [String: Any]
            let opts = (ct?["options"] as? [[String: Any]]) ?? []
            self.sheet("Chart type", opts.compactMap { o in
                guard let code = o["code"] as? String, let label = o["label"] as? String else { return nil }
                return (label: label, handler: { self.act("setChartType", code) })
            }, source: sender)
        }
    }

    @objc private func pickDrawing(_ sender: UIBarButtonItem) {
        snapshot { snap in
            let d = snap["drawings"] as? [String: Any]
            let tools = (d?["tools"] as? [[String: Any]]) ?? []
            var options: [(String, () -> Void)] = tools.compactMap { t in
                guard let code = t["code"] as? String, let label = t["label"] as? String else { return nil }
                return (label, { self.act("selectTool", code) })
            }
            options.append(("Clear all", { self.act("clearDrawings", nil) }))
            self.sheet("Drawing tools", options.map { (label: $0.0, handler: $0.1) }, source: sender)
        }
    }

    @objc private func pickIndicators(_ sender: UIBarButtonItem) {
        snapshot { snap in
            let ind = snap["indicators"] as? [String: Any]
            let popular = (ind?["popular"] as? [[String: Any]]) ?? []
            let active = (ind?["active"] as? [[String: Any]]) ?? []
            // active studies first (tap to remove), then popular (tap to add)
            var options: [(String, () -> Void)] = active.compactMap { s in
                guard let id = s["id"] as? String, let type = s["type"] as? String else { return nil }
                return ("Remove \(type)", { self.act("removeStudy", id) })
            }
            for p in popular {
                guard let code = p["code"] as? String, let label = p["label"] as? String else { continue }
                let isActive = active.contains { ($0["type"] as? String) == code }
                if !isActive { options.append(("Add \(label)", { self.act("addStudy", code) })) }
            }
            self.sheet("Indicators", options.map { (label: $0.0, handler: $0.1) }, source: sender)
        }
    }
}
