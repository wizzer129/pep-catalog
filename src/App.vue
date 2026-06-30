<script setup>
import { onMounted } from 'vue';
import { useCatalogStore } from './stores/catalog';
import AppNav from './components/AppNav.vue';

const catalog = useCatalogStore();

onMounted(() => catalog.load());
</script>

<template>
	<AppNav />
	<main>
		<router-view />
	</main>
</template>

<style scoped lang="less">
main {
	max-width: 1400px;
	margin: 0 auto;
	padding: 1.5rem 2rem;
	width: 100%;
}
</style>
