<script lang="ts">
	import Chart from "$lib/Chart.svelte";
</script>

<div class="app">
	<header>GoCharting SDK · SvelteKit example</header>
	<main><Chart /></main>
</div>

<style>
	:global(html),
	:global(body) {
		margin: 0;
		height: 100%;
		background: #0d0f14;
	}
	.app {
		display: flex;
		flex-direction: column;
		height: 100vh;
	}
	header {
		padding: 12px 16px;
		font: 600 14px system-ui, sans-serif;
		color: #e6e6e6;
		background: #15171e;
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
	}
	main {
		flex: 1;
		min-height: 0;
	}
</style>
