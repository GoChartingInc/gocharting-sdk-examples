const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");

/**
 * Metro doesn't treat .html as an asset by default. Adding it lets
 * `require("./assets/chart.html")` resolve, so the chart page (and the
 * index.umd.js next to it) ship inside the app bundle.
 *
 * Only add `html` here — adding `js` to assetExts makes Metro treat your own
 * source files as raw assets, which produces an effectively empty bundle.
 */
module.exports = (async () => {
	const defaultConfig = await getDefaultConfig(__dirname);
	return mergeConfig(defaultConfig, {
		resolver: {
			assetExts: [...defaultConfig.resolver.assetExts, "html"],
		},
	});
})();
