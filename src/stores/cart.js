import { defineStore } from 'pinia';
import { shallowRef, computed, watch } from 'vue';

const STORAGE_KEY = 'pepprice:cart';

export const useCartStore = defineStore('cart', () => {
	const saved = localStorage.getItem(STORAGE_KEY);
	const items = shallowRef(saved ? JSON.parse(saved) : {});

	watch(
		items,
		(val) => localStorage.setItem(STORAGE_KEY, JSON.stringify(val)),
		{ deep: true },
	);

	function addItem(vendorKey, row, priceEntry) {
		const vendor = { ...(items.value[vendorKey] ?? {}) };
		const existing = vendor[row.key];
		vendor[row.key] = existing
			? { ...existing, qty: existing.qty + 1 }
			: {
					product_name: row.product_name,
					mg: row.mg,
					price: priceEntry.price,
					vials: priceEntry.vials,
					qty: 1,
				};
		items.value = { ...items.value, [vendorKey]: vendor };
	}

	function clear() {
		items.value = {};
	}

	function removeItem(vendorKey, rowKey) {
		const vendor = { ...(items.value[vendorKey] ?? {}) };
		delete vendor[rowKey];
		const next = { ...items.value };
		if (Object.keys(vendor).length) {
			next[vendorKey] = vendor;
		} else {
			delete next[vendorKey];
		}
		items.value = next;
	}

	const cartVendors = computed(() => Object.keys(items.value));

	function vendorItems(vendorKey) {
		const vendor = items.value[vendorKey];
		if (!vendor) return [];
		return Object.entries(vendor).map(([rowKey, item]) => ({ rowKey, ...item }));
	}

	function vendorSubtotal(vendorKey) {
		return vendorItems(vendorKey).reduce((sum, item) => sum + item.price * item.qty, 0);
	}

	return { items, cartVendors, addItem, removeItem, clear, vendorItems, vendorSubtotal };
});
