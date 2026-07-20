// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: "2024-11-01",
	devtools: { enabled: false },
	// The SDK is browser-only; components are gated client-side via the
	// `.client.vue` suffix, so SSR of the app shell stays safe.
});
