<script setup>
import { shallowRef, computed, reactive, watch } from 'vue';
import { useCatalogStore } from '../stores/catalog';
import VendorFilter from '../components/VendorFilter.vue';
import SearchBar from '../components/SearchBar.vue';
import PriceTable from '../components/PriceTable.vue';

const catalog = useCatalogStore();

// All vendors selected by default once data loads
const selectedVendors = reactive(new Set());

watch(
	() => catalog.vendorKeys,
	(keys) => {
		if (keys.length && selectedVendors.size === 0) {
			keys.forEach((k) => selectedVendors.add(k));
		}
	},
	{ immediate: true },
);

function toggleVendor(key) {
	if (selectedVendors.has(key)) {
		selectedVendors.delete(key);
	} else {
		selectedVendors.add(key);
	}
}

const activeVendors = computed(() => catalog.vendorKeys.filter((k) => selectedVendors.has(k)));

const search = shallowRef('');

const filteredRows = computed(() => {
	const q = search.value.trim().toLowerCase();
	if (!q) return catalog.productRows;
	return catalog.productRows.filter((r) => r.product_name.toLowerCase().includes(q));
});
</script>

<template>
	<div v-if="catalog.loading" class="state-msg">Loading catalog…</div>
	<div v-else-if="catalog.error" class="state-msg error">{{ catalog.error }}</div>

	<template v-else>
		<VendorFilter
			:vendors="catalog.vendorKeys"
			:selected="selectedVendors"
			@toggle="toggleVendor"
		/>

		<SearchBar v-model="search" @filter="() => {}" />

		<PriceTable :rows="filteredRows" :vendors="activeVendors" :price-map="catalog.priceMap" />
	</template>
</template>

<style scoped lang="less">
.state-msg {
	padding: 3rem;
	text-align: center;
	color: var(--text-muted);
	font-size: 0.9rem;

	&.error {
		color: var(--red);
	}
}
</style>
