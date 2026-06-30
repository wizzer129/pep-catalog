<script setup>
import { onMounted } from 'vue';
import { useCatalogStore } from './stores/catalog';
import CatalogView from './views/CatalogView.vue';

const catalog = useCatalogStore();

onMounted(() => catalog.load());
</script>

<template>
	<header>
		<div class="header-inner">
			<span class="logo-mark">⬡</span>
			<span class="brand">PepPrice</span>
			<span class="tagline">Peptide price comparison</span>
		</div>
	</header>

	<main>
		<CatalogView />
	</main>
</template>

<style scoped lang="less">
header {
	background: var(--surface);
	border-bottom: 1px solid var(--border);
	padding: 0 2rem;
}

.header-inner {
	max-width: 1280px;
	margin: 0 auto;
	height: 56px;
	display: flex;
	align-items: center;
	gap: 0.75rem;
}

.logo-mark {
	font-size: 1.5rem;
	color: var(--teal);
	line-height: 1;
}

.brand {
	font-size: 1.25rem;
	font-weight: 700;
	color: var(--text);
	letter-spacing: -0.02em;
}

.tagline {
	font-size: 0.8rem;
	color: var(--text-muted);
	margin-left: 0.25rem;
}
</style>
