import { defineStore } from 'pinia';
import { shallowRef, computed } from 'vue';

export const useCatalogStore = defineStore('catalog', () => {
	const suppliers = shallowRef({});
	const loading = shallowRef(false);
	const error = shallowRef(null);

	async function load() {
		loading.value = true;
		error.value = null;
		try {
			const mod = await import('../catalog/peptide_suppliers.json');
			suppliers.value = mod.default;
		} catch (e) {
			error.value = e.message;
		} finally {
			loading.value = false;
		}
	}

	// Ordered list of vendor keys
	const vendorKeys = computed(() => Object.keys(suppliers.value));

	// Unique product names, sorted alphabetically. Row key === product_name.
	const productRows = computed(() => {
		const names = new Set();
		for (const vendor of Object.values(suppliers.value)) {
			for (const p of vendor.products) {
				names.add(p.product_name);
			}
		}
		return [...names].sort((a, b) => a.localeCompare(b)).map((name) => ({ key: name, product_name: name }));
	});

	// priceMap[vendorKey][productName] = { price, spec } for the lowest retail price offered
	const priceMap = computed(() => {
		const map = {};
		for (const [vKey, vendor] of Object.entries(suppliers.value)) {
			map[vKey] = {};
			for (const p of vendor.products) {
				const raw = p.price_per_kit;
				// price_per_kit is sometimes { retail, wholesale } instead of a plain number
				const price = Number(typeof raw === 'object' && raw !== null ? raw.retail : raw);
				if (isNaN(price)) continue;
				const existing = map[vKey][p.product_name];
				if (existing === undefined || price < existing.price) {
					map[vKey][p.product_name] = { price, spec: p.specification };
				}
			}
		}
		return map;
	});

	return { suppliers, loading, error, load, vendorKeys, productRows, priceMap };
});
