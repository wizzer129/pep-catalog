<script setup>
import { shallowRef, computed, watch } from 'vue';
import { useCartStore } from '../stores/cart';
import { useCatalogStore } from '../stores/catalog';

const cart = useCartStore();
const catalog = useCatalogStore();

const selectedVendor = shallowRef(null);
const vendorDropdownOpen = shallowRef(false);

function pickVendor(v) {
	selectedVendor.value = v;
	vendorDropdownOpen.value = false;
}

function onVendorSelectBlur() {
	setTimeout(() => {
		vendorDropdownOpen.value = false;
	}, 150);
}

watch(
	() => cart.cartVendors,
	(vendors) => {
		if (!vendors.includes(selectedVendor.value)) {
			selectedVendor.value = vendors[0] ?? null;
		}
	},
	{ immediate: true },
);

const items = computed(() => (selectedVendor.value ? cart.vendorItems(selectedVendor.value) : []));
const subtotal = computed(() =>
	selectedVendor.value ? cart.vendorSubtotal(selectedVendor.value) : 0,
);
const shippingFee = computed(
	() => catalog.suppliers[selectedVendor.value]?.contact?.shipping_fee ?? 0,
);
const shippingNote = computed(
	() => catalog.suppliers[selectedVendor.value]?.contact?.shipping_note ?? null,
);
const total = computed(() => subtotal.value + shippingFee.value);

const vendorTotals = computed(() => {
	const rows = cart.cartVendors.map((v) => {
		const vSubtotal = cart.vendorSubtotal(v);
		const vShipping = catalog.suppliers[v]?.contact?.shipping_fee ?? 0;
		const region = catalog.suppliers[v]?.region ?? 'China';
		const itemCount = cart.vendorItems(v).reduce((sum, item) => sum + item.qty, 0);
		return {
			vendor: v,
			region,
			itemCount,
			subtotal: vSubtotal,
			shipping: vShipping,
			total: vSubtotal + vShipping,
		};
	});
	return rows.sort((a, b) => a.total - b.total);
});

const chinaVendorTotals = computed(() => vendorTotals.value.filter((r) => r.region === 'China'));
const usVendorTotals = computed(() => vendorTotals.value.filter((r) => r.region === 'US'));
</script>

<template>
	<div class="cart-panel">
		<div class="cart-header">
			<h2 class="cart-title">Cart</h2>
			<button
				v-if="cart.cartVendors.length"
				class="clear-btn"
				title="Clear cart"
				aria-label="Clear cart"
				@click="cart.clear()"
			>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M3 6h18" stroke-linecap="round" />
					<path
						d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
					<path
						d="M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
					<path d="M10 11v6" stroke-linecap="round" />
					<path d="M14 11v6" stroke-linecap="round" />
				</svg>
			</button>
		</div>

		<p v-if="!cart.cartVendors.length" class="empty">Cart is empty. Click a price to add it.</p>

		<template v-else>
			<div class="vendor-picker" :class="{ open: vendorDropdownOpen }">
				<button
					type="button"
					class="vendor-select"
					@click="vendorDropdownOpen = !vendorDropdownOpen"
					@blur="onVendorSelectBlur"
				>
					<span>{{ selectedVendor?.replace(/_/g, ' ') }}</span>
					<span class="vendor-select-arrow">▾</span>
				</button>
				<ul v-if="vendorDropdownOpen" class="vendor-dropdown">
					<li
						v-for="v in cart.cartVendors"
						:key="v"
						:class="{ active: v === selectedVendor }"
						@mousedown.prevent="pickVendor(v)"
					>
						{{ v.replace(/_/g, ' ') }}
					</li>
				</ul>
			</div>

			<ul class="item-list">
				<li v-for="item in items" :key="item.rowKey" class="item">
					<div class="item-info">
						<span class="item-name"
							>{{ item.product_name }}
							<span class="item-mg">{{ item.mg }}</span></span
						>
						<span class="item-line">{{ item.qty }} × ${{ item.price.toFixed(2) }}</span>
					</div>
					<button
						class="remove-btn"
						@click="cart.removeItem(selectedVendor, item.rowKey)"
					>
						✕
					</button>
				</li>
			</ul>

			<div class="summary">
				<div class="summary-row">
					<span>Subtotal</span>
					<span>${{ subtotal.toFixed(2) }}</span>
				</div>
				<div class="summary-row">
					<span>Shipping</span>
					<span>${{ shippingFee.toFixed(2) }}</span>
				</div>
				<p v-if="shippingNote" class="shipping-note">{{ shippingNote }}</p>
				<div class="summary-row total">
					<span>Total</span>
					<span>${{ total.toFixed(2) }}</span>
				</div>
			</div>

			<div v-if="vendorTotals.length > 1" class="comparison">
				<h3 class="comparison-title">Compare Vendors</h3>

				<template v-if="chinaVendorTotals.length">
					<h4 class="comparison-group">China</h4>
					<ul class="comparison-list">
						<li
							v-for="(row, i) in chinaVendorTotals"
							:key="row.vendor"
							class="comparison-row"
							:class="{ active: row.vendor === selectedVendor, cheapest: i === 0 }"
							@click="selectedVendor = row.vendor"
						>
							<span class="comparison-vendor">{{
								row.vendor.replace(/_/g, ' ')
							}}</span>
							<span class="comparison-count"
								>{{ row.itemCount }} item{{ row.itemCount === 1 ? '' : 's' }}</span
							>
							<span class="comparison-total">${{ row.total.toFixed(2) }}</span>
						</li>
					</ul>
				</template>

				<template v-if="usVendorTotals.length">
					<h4 class="comparison-group">US</h4>
					<ul class="comparison-list">
						<li
							v-for="(row, i) in usVendorTotals"
							:key="row.vendor"
							class="comparison-row"
							:class="{ active: row.vendor === selectedVendor, cheapest: i === 0 }"
							@click="selectedVendor = row.vendor"
						>
							<span class="comparison-vendor">{{
								row.vendor.replace(/_/g, ' ')
							}}</span>
							<span class="comparison-count"
								>{{ row.itemCount }} item{{ row.itemCount === 1 ? '' : 's' }}</span
							>
							<span class="comparison-total">${{ row.total.toFixed(2) }}</span>
						</li>
					</ul>
				</template>
			</div>
		</template>
	</div>
</template>

<style scoped lang="less">
.cart-panel {
	border: 1px solid var(--border);
	border-radius: 12px;
	background: none;
	padding: 1rem;
}

.cart-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 0.75rem;
}

.cart-title {
	font-size: 0.85rem;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: 0.06em;
	color: var(--text-muted);
}

.clear-btn {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	background: none;
	border: none;
	color: var(--text-muted);
	cursor: pointer;
	padding: 0.2rem;
	border-radius: 4px;

	svg {
		width: 15px;
		height: 15px;
	}

	&:hover {
		color: var(--red);
	}
}

.empty {
	font-size: 0.8rem;
	color: var(--text-muted);
}

.vendor-picker {
	position: relative;
	margin-bottom: 0.75rem;
}

.vendor-select {
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 0.5rem;
	padding: 0.4rem 0.5rem;
	background: var(--surface);
	border: 1px solid var(--border);
	border-radius: 6px;
	color: var(--text);
	font-size: 0.82rem;
	font-family: inherit;
	text-align: left;
	cursor: pointer;
	transition: border-color 0.15s;

	span:first-child {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.vendor-picker.open & {
		border-color: var(--teal-dim);
		backdrop-filter: blur(16px);
	}
}

.vendor-select-arrow {
	flex-shrink: 0;
	font-size: 0.65rem;
	color: var(--text-muted);
}

.vendor-dropdown {
	position: absolute;
	top: calc(100% + 4px);
	left: 0;
	right: 0;
	max-height: 220px;
	overflow-y: auto;
	background: var(--surface2);
	backdrop-filter: blur(16px);

	border: 1px solid var(--border);
	border-radius: 6px;
	z-index: 20;
	list-style: none;
	margin: 0;
	padding: 0.25rem 0;

	li {
		padding: 0.45rem 0.6rem;
		font-size: 0.82rem;
		color: var(--text);
		cursor: pointer;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;

		&:hover {
			background: var(--surface);
			color: var(--teal);
		}

		&.active {
			color: var(--teal);
			font-weight: 600;
		}
	}
}

.item-list {
	list-style: none;
	margin: 0;
	padding: 0;
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.item {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 0.4rem;
	padding-bottom: 0.5rem;
	border-bottom: 1px solid var(--border);
}

.item-info {
	display: flex;
	flex-direction: column;
	gap: 0.15rem;
	min-width: 0;
}

.item-name {
	font-size: 0.8rem;
	font-weight: 500;
	color: var(--text);
	word-break: break-word;
}

.item-mg {
	font-size: 0.8rem;
	color: var(--text);
	background: var(--teal);
	margin-left: 0.3rem;
	padding: 0.03rem 0.35rem;
	border-radius: 999px;
	opacity: 0.85;
}

.item-line {
	font-size: 0.72rem;
	color: var(--text-muted);
	font-family: 'IBM Plex Mono', monospace;
}

.remove-btn {
	flex-shrink: 0;
	background: none;
	border: none;
	color: var(--text-muted);
	cursor: pointer;
	font-size: 0.75rem;
	padding: 0.1rem 0.3rem;

	&:hover {
		color: var(--red);
	}
}

.summary {
	margin-top: 0.75rem;
	padding-top: 0.6rem;
	border-top: 2px solid var(--border);
	display: flex;
	flex-direction: column;
	gap: 0.3rem;
}

.summary-row {
	display: flex;
	justify-content: space-between;
	font-size: 0.78rem;
	color: var(--text-muted);

	&.total {
		font-size: 0.88rem;
		font-weight: 700;
		color: var(--text);
	}
}

.shipping-note {
	margin-top: 0.5rem;
	font-size: 0.7rem;
	font-style: italic;
	color: var(--teal-dim);
}

.comparison {
	margin-top: 1rem;
	padding-top: 0.75rem;
	border-top: 1px solid var(--border);
}

.comparison-title {
	font-size: 0.72rem;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: 0.06em;
	color: var(--text-muted);
	margin-bottom: 0.5rem;
}

.comparison-group {
	font-size: 0.68rem;
	font-weight: 600;
	text-transform: uppercase;
	letter-spacing: 0.05em;
	color: var(--teal-dim);
	margin: 0.5rem 0 0.3rem;
}

.comparison-list {
	list-style: none;
	margin: 0;
	padding: 0;
	display: flex;
	flex-direction: column;
	gap: 0.3rem;
}

.comparison-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 0.5rem;
	padding: 0.35rem 0.5rem;
	border-radius: 6px;
	border: 1px solid transparent;
	cursor: pointer;
	font-size: 0.76rem;
	transition:
		background 0.12s,
		border-color 0.12s;

	&:hover {
		background: color-mix(in srgb, var(--teal) 8%, transparent);
	}

	&.active {
		border-color: var(--teal-dim);
	}

	&.cheapest .comparison-total {
		color: #5db87a;
		font-weight: 700;
	}

	[data-theme='light'] &.cheapest .comparison-total {
		color: #3a7d52;
	}
}

.comparison-vendor {
	flex: 1;
	min-width: 0;
	color: var(--text);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.comparison-count {
	flex-shrink: 0;
	font-size: 0.68rem;
	color: var(--text-muted);
	white-space: nowrap;
}

.comparison-total {
	flex-shrink: 0;
	width: 4.2rem;
	text-align: right;
	font-family: 'IBM Plex Mono', monospace;
	color: var(--text-muted);
}
</style>
