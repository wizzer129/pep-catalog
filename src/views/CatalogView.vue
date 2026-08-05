<script setup>
import { shallowRef, computed, reactive, watch } from 'vue';
import { useCatalogStore } from '../stores/catalog';
import VendorFilter from '../components/VendorFilter.vue';
import SearchBar from '../components/SearchBar.vue';
import PriceTable from '../components/PriceTable.vue';
import CartPanel from '../components/CartPanel.vue';

const STORAGE_KEY = 'pepprice:selected-vendors';
const SEARCH_STORAGE_KEY = 'pepprice:selected-products';

const catalog = useCatalogStore();

const selectedVendors = reactive(new Set());

watch(
	() => catalog.vendorKeys,
	(keys) => {
		if (!keys.length) return;
		// On first load: restore from localStorage, falling back to all selected
		const saved = localStorage.getItem(STORAGE_KEY);
		const initial = saved ? new Set(JSON.parse(saved)) : new Set(keys);
		keys.forEach((k) => {
			if (initial.has(k)) selectedVendors.add(k);
		});
	},
	{ immediate: true },
);

function toggleVendor(key) {
	if (selectedVendors.has(key)) {
		selectedVendors.delete(key);
	} else {
		selectedVendors.add(key);
	}
	localStorage.setItem(STORAGE_KEY, JSON.stringify([...selectedVendors]));
}

const VENDOR_COLORS = [
	'#6b9fff',
	'#a67de8',
	'#f5a030',
	'#4dbf7a',
	'#ff6b6b',
	'#36c5e8',
	'#cc8855',
	'#8bc34a',
	'#d46bd4',
	'#5b9bd5',
];

const activeVendors = computed(() => catalog.vendorKeys.filter((k) => selectedVendors.has(k)));

const activeVendorColors = computed(() =>
	activeVendors.value.map((k) => {
		const idx = catalog.vendorKeys.indexOf(k) % VENDOR_COLORS.length;
		return VENDOR_COLORS[idx < 0 ? 0 : idx];
	}),
);

const savedProducts = localStorage.getItem(SEARCH_STORAGE_KEY);
const selectedProducts = shallowRef(savedProducts ? JSON.parse(savedProducts) : []);

watch(selectedProducts, (val) => localStorage.setItem(SEARCH_STORAGE_KEY, JSON.stringify(val)));

const productNames = computed(() => catalog.productRows.map((r) => r.key));

const filteredRows = computed(() => {
	const picks = selectedProducts.value;
	const vendors = activeVendors.value;
	const priceMap = catalog.priceMap;

	return catalog.productRows.filter((r) => {
		if (!vendors.some((v) => priceMap[v]?.[r.key] != null)) return false;
		return !picks.length || picks.includes(r.key);
	});
});
</script>

<template>
	<div v-if="catalog.loading" class="state-msg">Loading catalog…</div>
	<div v-else-if="catalog.error" class="state-msg error">{{ catalog.error }}</div>

	<template v-else>
		<div class="catalog-page">
			<div class="catalog-container">
				<VendorFilter
					:vendors="catalog.vendorKeys"
					:selected="selectedVendors"
					@toggle="toggleVendor"
				/>
				<SearchBar
					class="catalog-search-bar"
					v-model="selectedProducts"
					:options="productNames"
				/>
				<PriceTable
					:rows="filteredRows"
					:vendors="activeVendors"
					:price-map="catalog.priceMap"
					:vendor-colors="activeVendorColors"
					:page-size="11"
				/>
			</div>
			<CartPanel class="cart-panel" />
		</div>
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

.catalog-page {
	display: flex;
	align-items: flex-start;
	gap: 1rem;
}

.catalog-container {
	display: flex;
	flex-direction: column;
	justify-content: start;
	align-items: stretch;
	gap: 0.5rem;
	flex: 1;
	min-width: 0;

	.catalog-search-bar {
		width: 100%;
		min-width: 600px;
	}
}

.cart-panel {
	width: 320px;
	flex-shrink: 0;
	position: sticky;
	top: 1rem;
}
</style>
