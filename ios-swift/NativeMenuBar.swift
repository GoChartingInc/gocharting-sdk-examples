import UIKit
import WebKit

/// A native bottom bar that drives the chart through the page's `gcMenu` bridge
/// (see chart.html). This is the "option 3" integration: the SDK renders the
/// canvas only (`nativeChrome: "none"`) and the host owns every menu.
///
/// Built as a plain `UIView` with a `UIStackView` of buttons — not a UIToolbar,
/// whose background is overridden by the system appearance in dark mode and
/// would render dark instead of brand yellow. Every control is native UIKit;
/// the only JavaScript is a `gcMenu.act(...)` per selection and a
/// `gcMenu.snapshot()` read to populate the sheets — the same two calls every
/// platform makes, so this mirrors the Android / Flutter / React Native menus.
final class NativeMenuBar: UIView {

    private weak var webView: WKWebView?
    /// Presents the action sheets — the hosting view controller.
    private weak var presenter: UIViewController?

    private static let brand = UIColor(red: 1.0, green: 0.667, blue: 0.004, alpha: 1) // #ffaa01
    private static let ink = UIColor(red: 0.10, green: 0.098, blue: 0.137, alpha: 1)  // #1a1923

    init(webView: WKWebView, presenter: UIViewController) {
        self.webView = webView
        self.presenter = presenter
        super.init(frame: .zero)
        backgroundColor = Self.brand // a UIView background is never overridden

        let stack = UIStackView(arrangedSubviews: [
            button("Interval", #selector(pickInterval)),
            button("Type", #selector(pickChartType)),
            button("Draw", #selector(pickDrawing)),
            button("Indicators", #selector(pickIndicators)),
        ])
        stack.axis = .horizontal
        stack.distribution = .fillEqually
        stack.translatesAutoresizingMaskIntoConstraints = false
        addSubview(stack)
        NSLayoutConstraint.activate([
            stack.leadingAnchor.constraint(equalTo: leadingAnchor),
            stack.trailingAnchor.constraint(equalTo: trailingAnchor),
            stack.topAnchor.constraint(equalTo: topAnchor),
            stack.bottomAnchor.constraint(equalTo: bottomAnchor),
            heightAnchor.constraint(equalToConstant: 56),
        ])
    }

    required init?(coder: NSCoder) { fatalError("init(coder:) not used") }

    private func button(_ title: String, _ action: Selector) -> UIButton {
        let b = UIButton(type: .system)
        b.setTitle(title, for: .normal)
        b.setTitleColor(Self.ink, for: .normal)
        b.titleLabel?.font = .systemFont(ofSize: 15, weight: .semibold)
        b.addTarget(self, action: action, for: .touchUpInside)
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
                       source: UIView? = nil) {
        let ac = UIAlertController(title: title, message: nil, preferredStyle: .actionSheet)
        for o in options {
            ac.addAction(UIAlertAction(title: o.label, style: .default) { _ in o.handler() })
        }
        ac.addAction(UIAlertAction(title: "Cancel", style: .cancel))
        // iPad requires a popover anchor.
        if let anchor = source ?? self as UIView? {
            ac.popoverPresentationController?.sourceView = anchor
            ac.popoverPresentationController?.sourceRect = anchor.bounds
        }
        presenter?.present(ac, animated: true)
    }

    @objc private func pickInterval(_ sender: UIButton) {
        snapshot { snap in
            let iv = snap["interval"] as? [String: Any]
            let current = iv?["current"] as? String
            let options = (iv?["options"] as? [String]) ?? []
            self.sheet("Interval", options.map { code in
                (label: code == current ? "\(code)  ✓" : code, handler: { self.act("setInterval", code) })
            }, source: sender)
        }
    }

    @objc private func pickChartType(_ sender: UIButton) {
        snapshot { snap in
            let ct = snap["chartType"] as? [String: Any]
            let opts = (ct?["options"] as? [[String: Any]]) ?? []
            self.sheet("Chart type", opts.compactMap { o in
                guard let code = o["code"] as? String, let label = o["label"] as? String else { return nil }
                return (label: label, handler: { self.act("setChartType", code) })
            }, source: sender)
        }
    }

    @objc private func pickDrawing(_ sender: UIButton) {
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

    @objc private func pickIndicators(_ sender: UIButton) {
        snapshot { snap in
            let ind = snap["indicators"] as? [String: Any]
            let catalog = (ind?["catalog"] as? [[String: Any]]) ?? []
            let active = (ind?["active"] as? [[String: Any]]) ?? []
            let activeTypes = Set(active.compactMap { $0["type"] as? String })

            // Group by `groupName` — the field getStudiesCatalog() attaches. The
            // SDK owns the grouping; the host just buckets by it. Entries fall
            // under "Other" only on older bundles that predate the method.
            var groups: [String: [[String: Any]]] = [:]
            for c in catalog {
                groups[(c["groupName"] as? String) ?? "Other", default: []].append(c)
            }

            // Active studies first (tap to remove), then one row per group that
            // opens a second sheet of that group's indicators (action sheets
            // can't render headers, so drill in — same catalog, grouped).
            var options: [(label: String, handler: () -> Void)] = active.compactMap { s in
                guard let id = s["id"] as? String, let type = s["type"] as? String else { return nil }
                return ("Remove \(type)", { self.act("removeStudy", id) })
            }
            for g in groups.keys.sorted() {
                options.append(("\(g) ▸", {
                    let items: [(label: String, handler: () -> Void)] = (groups[g] ?? []).compactMap { c in
                        guard let type = c["type"] as? String, let name = c["name"] as? String,
                              !activeTypes.contains(type) else { return nil }
                        return ("Add \(name)", { self.act("addStudy", type) })
                    }
                    self.sheet(g, items, source: sender)
                }))
            }
            self.sheet("Indicators", options, source: sender)
        }
    }
}
