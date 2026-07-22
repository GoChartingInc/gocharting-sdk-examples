const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");

/**
 * Metro doesn't treat .html as an asset by default. Adding it lets
 * `require("./assets/chart.html")` resolve, so the chart page (and the
 * index.umd.js next to it) ship inside the app bundle.
 */
const config = {
	resolver: {
		assetExts: ["html", "js"],
	},
};

module.exports = (async () => {
	const defaultConfig = await getDefaultConfig(__dirname);
	return mergeConfig(defaultConfig, {
		resolver: {
			assetExts: [...defaultConfig.resolver.assetExts, ...config.resolver.assetExts],
		},
	});
})();
