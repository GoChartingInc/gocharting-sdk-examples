<script setup lang="ts">
import Chart from "./Chart.vue";
</script>

<template>
	<div class="app">
		<header class="app-header">GoCharting SDK · Vue example</header>
		<main class="app-main">
			<Chart />
		</main>
	</div>
</template>

<style scoped>
.app {
	display: flex;
	flex-direction: column;
	height: 100vh;
}
.app-header {
	padding: 12px 16px;
	font: 600 14px system-ui, sans-serif;
	color: #e6e6e6;
	background: #15171e;
	border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.app-main {
	flex: 1;
	min-height: 0;
}
</style>
