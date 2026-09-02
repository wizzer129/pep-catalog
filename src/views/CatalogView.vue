<script setup>
import { shallowRef, computed, reactive, watch, onMounted, onBeforeUnmount } from 'vue';
import { useCatalogStore } from '../stores/catalog';
import { useCartStore } from '../stores/cart';
import { vendorColor } from '../constants/vendorColors.js';
import VendorFilter from '../components/VendorFilter.vue';
import SearchBar from '../components/SearchBar.vue';
import PriceTable from '../components/PriceTable.vue';
import CartPanel from '../components/CartPanel.vue';

const STORAGE_KEY = 'pepprice:selected-vendors';
const SEARCH_STORAGE_KEY = 'pepprice:selected-products';

const catalog = useCatalogStore();
const cart = useCartStore();

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

const activeVendors = computed(() => catalog.vendorKeys.filter((k) => selectedVendors.has(k)));

const activeVendorColors = computed(() =>
	activeVendors.value.map((k) => vendorColor(catalog.vendorKeys, k)),
);

const savedProducts = localStorage.getItem(SEARCH_STORAGE_KEY);
const selectedProducts = shallowRef(savedProducts ? JSON.parse(savedProducts) : []);

watch(selectedProducts, (val) => localStorage.setItem(SEARCH_STORAGE_KEY, JSON.stringify(val)));

const productNames = computed(() => [...new Set(catalog.productRows.map((r) => r.product_name))]);

const filteredRows = computed(() => {
	const picks = selectedProducts.value;
	const vendors = activeVendors.value;
	const priceMap = catalog.priceMap;

	return catalog.productRows.filter((r) => {
		if (!vendors.some((v) => priceMap[v]?.[r.key] != null)) return false;
		return !picks.length || picks.includes(r.product_name);
	});
});

const mobileCartOpen = shallowRef(false);

// Mobile browsers resize the visual viewport (not the layout viewport) when
// their address bar shows/hides, which can leave `position: fixed` bottom
// bars stranded below the visible area. Track the delta and nudge the pill
// to compensate so it always sits at the bottom of what's actually visible.
const pillOffset = shallowRef(0);

function syncPillOffset() {
	const vv = window.visualViewport;
	if (!vv) return;
	pillOffset.value = Math.max(0, window.innerHeight - (vv.height + vv.offsetTop));
}

onMounted(() => {
	syncPillOffset();
	window.visualViewport?.addEventListener('resize', syncPillOffset);
	window.visualViewport?.addEventListener('scroll', syncPillOffset);
});

onBeforeUnmount(() => {
	window.visualViewport?.removeEventListener('resize', syncPillOffset);
	window.visualViewport?.removeEventListener('scroll', syncPillOffset);
});

const vendorTotals = computed(() =>
	cart.cartVendors
		.map((vendor) => {
			const subtotal = cart.vendorSubtotal(vendor);
			const shipping = catalog.suppliers[vendor]?.contact?.shipping_fee ?? 0;
			return {
				vendor,
				total: subtotal + shipping,
			};
		})
		.sort((a, b) => a.total - b.total),
);

const lowestTotalVendor = computed(() => vendorTotals.value[0] ?? null);

const lowestVendorLabel = computed(() => {
	if (!lowestTotalVendor.value) return 'Cart is empty';
	return lowestTotalVendor.value.vendor.replace(/_/g, ' ');
});

const lowestVendorTotalLabel = computed(() => {
	if (!lowestTotalVendor.value) return '';
	return `$${lowestTotalVendor.value.total.toFixed(2)}`;
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

		<div
			v-if="cart.cartVendors.length"
			class="mobile-order-pill-wrap"
			:style="{ transform: `translateY(-${pillOffset}px)` }"
		>
			<div class="mobile-order-pill" role="region" aria-label="Cart summary">
				<div class="pill-vendor">
					<span class="pill-vendor-name">{{ lowestVendorLabel }}</span>
					<span v-if="lowestVendorTotalLabel" class="pill-vendor-total">{{
						lowestVendorTotalLabel
					}}</span>
				</div>
				<button class="pill-action" type="button" @click="mobileCartOpen = true">
					Review Order
				</button>
			</div>
		</div>

		<div
			v-if="mobileCartOpen"
			class="mobile-cart-modal"
			role="dialog"
			aria-modal="true"
			aria-label="Review order"
			@click.self="mobileCartOpen = false"
		>
			<div class="mobile-cart-sheet">
				<div class="mobile-cart-head">
					<h3>Review Order</h3>
					<button type="button" class="mobile-cart-close" @click="mobileCartOpen = false">
						✕
					</button>
				</div>
				<CartPanel class="mobile-cart-panel" />
			</div>
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
	gap: 0.5rem;
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
	top: 4rem;
}

.mobile-order-pill-wrap,
.mobile-cart-modal {
	display: none;
}

@media (max-width: 980px) {
	.catalog-page {
		display: flex;
		justify-content: center;
	}

	.catalog-container {
		width: min(100%, 1040px);
		margin-inline: auto;
		padding-inline: 0.35rem;
		box-sizing: border-box;

		.catalog-search-bar {
			min-width: 0;
		}
	}

	.cart-panel:not(.mobile-cart-panel) {
		display: none;
	}

	.mobile-order-pill-wrap {
		display: flex;
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0.75rem;
		z-index: 45;
		justify-content: center;
		padding-left: 0.75rem;
		padding-right: 0.75rem;
		pointer-events: none;
		transition: transform 0.1s linear;
	}

	.mobile-order-pill {
		pointer-events: auto;
		display: flex;
		width: 100%;
		max-width: 1040px;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 0.55rem 0.55rem 0.55rem 0.8rem;
		border-radius: 999px;
		backdrop-filter: blur(16px);
		background: color-mix(in srgb, var(--surface2) 92%, var(--bg));
		border: 1px solid color-mix(in srgb, var(--teal-dim) 55%, var(--border));
		box-shadow: 0 12px 32px color-mix(in srgb, var(--bg) 55%, transparent);
	}

	.pill-vendor {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.pill-label {
		font-size: 0.62rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.pill-vendor-name {
		font-size: 0.82rem;
		font-weight: 600;
		color: var(--text);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.pill-vendor-total {
		font-size: 0.78rem;
		font-weight: 700;
		font-family: 'IBM Plex Mono', monospace;
		color: var(--teal);
	}

	.pill-action {
		flex-shrink: 0;
		border: 1px solid var(--teal);
		background: var(--teal);
		color: #061016;
		padding: 0.5rem 0.9rem;
		border-radius: 999px;
		font-size: 0.76rem;
		font-weight: 700;
		cursor: pointer;
	}

	.mobile-cart-modal {
		display: flex;
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		z-index: 60;
		background: color-mix(in srgb, #000 45%, transparent);
		align-items: flex-end;
		justify-content: center;
	}

	.mobile-cart-sheet {
		width: min(100%, 1040px);
		margin: 0 auto;
		max-height: 82vh;
		overflow: hidden;
		background: var(--bg);
		border-top-left-radius: 16px;
		border-top-right-radius: 16px;
		border-top: 1px solid var(--border);
		padding: 0.65rem 0.75rem 0.75rem;
	}

	.mobile-cart-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 0.55rem;

		h3 {
			margin: 0;
			font-size: 0.88rem;
			text-transform: uppercase;
			letter-spacing: 0.06em;
			color: var(--text-muted);
		}
	}

	.mobile-cart-close {
		border: none;
		background: none;
		color: var(--text-muted);
		font-size: 1rem;
		padding: 0.1rem 0.4rem;
		cursor: pointer;
	}

	.mobile-cart-panel {
		max-height: calc(82vh - 3rem);
		overflow: auto;
	}

	.catalog-container {
		padding-bottom: 5.25rem;
	}
}
</style>
