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
	const vendorKeys = computed(() => Object.keys(suppliers.value).sort((a, b) => a.localeCompare(b)));

	// Unique product+mg combinations, sorted alphabetically. Row key === "product_name mg".
	const productRows = computed(() => {
		const seen = new Set();
		const rows = [];
		for (const vendor of Object.values(suppliers.value)) {
			for (const p of vendor.products) {
				const key = `${p.product_name} ${p.mg}`;
				if (!seen.has(key)) {
					seen.add(key);
					rows.push({ key, product_name: p.product_name, mg: p.mg });
				}
			}
		}
		return rows.sort((a, b) => a.key.localeCompare(b.key));
	});

	// priceMap[vendorKey]["product_name mg"] = { price, mg, vials } for the lowest retail price offered
	const priceMap = computed(() => {
		const map = {};
		for (const [vKey, vendor] of Object.entries(suppliers.value)) {
			map[vKey] = {};
			for (const p of vendor.products) {
				const raw = p.price_per_kit;
				// price_per_kit is sometimes { retail, wholesale } instead of a plain number
				const price = Number(typeof raw === 'object' && raw !== null ? raw.retail : raw);
				if (isNaN(price)) continue;
				const key = `${p.product_name} ${p.mg}`;
				const existing = map[vKey][key];
				if (existing === undefined || price < existing.price) {
					map[vKey][key] = { price, mg: p.mg, vials: p.vials };
				}
			}
		}
		return map;
	});

	return { suppliers, loading, error, load, vendorKeys, productRows, priceMap };
});
