<script setup>
import { computed, shallowRef, watch } from 'vue';
import { useCartStore } from '../stores/cart';

const cart = useCartStore();

function addRowToCart(row) {
	for (const v of props.vendors) {
		const entry = props.priceMap[v]?.[row.key];
		if (entry != null) cart.addItem(v, row, entry);
	}
}

function isRowInCart(row) {
	return props.vendors.some((v) => cart.items[v]?.[row.key] != null);
}

function removeRowFromCart(row) {
	for (const v of props.vendors) {
		if (cart.items[v]?.[row.key] != null) cart.removeItem(v, row.key);
	}
}

const props = defineProps({
	rows: { type: Array, required: true },
	vendors: { type: Array, required: true },
	priceMap: { type: Object, required: true },
	pageSize: { type: Number, default: 25 },
	vendorColors: { type: Array, default: () => [] },
});

const page = shallowRef(1);
const sortDir = shallowRef(null); // null | 'asc' | 'desc'

function cycleSort() {
	sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc';
	page.value = 1;
}

function mgValue(mg) {
	const n = parseFloat(mg);
	return isNaN(n) ? 0 : n;
}

// Break the flat "product + mg" row list down into one group per product,
// each holding its own variants (mg × vials) sorted low to high.
const productGroups = computed(() => {
	const order = [];
	const byProduct = new Map();
	for (const row of props.rows) {
		if (!byProduct.has(row.product_name)) {
			byProduct.set(row.product_name, []);
			order.push(row.product_name);
		}
		byProduct.get(row.product_name).push(row);
	}

	order.sort((a, b) => (sortDir.value === 'desc' ? b.localeCompare(a) : a.localeCompare(b)));

	return order.map((product_name) => {
		const variants = [...byProduct.get(product_name)].sort(
			(a, b) => mgValue(a.mg) - mgValue(b.mg),
		);
		// Only keep vendor columns that price at least one variant of this
		// product — a column of all dashes just adds noise.
		const vendors = [];
		const vendorColors = [];
		props.vendors.forEach((v, i) => {
			if (variants.some((row) => props.priceMap[v]?.[row.key] != null)) {
				vendors.push(v);
				vendorColors.push(props.vendorColors[i]);
			}
		});
		return { product_name, variants, vendors, vendorColors };
	});
});

watch(
	() => props.rows,
	() => {
		page.value = 1;
	},
);

const totalPages = computed(() =>
	Math.max(1, Math.ceil(productGroups.value.length / props.pageSize)),
);

const pageGroups = computed(() => {
	const start = (page.value - 1) * props.pageSize;
	return productGroups.value.slice(start, start + props.pageSize);
});

function vialsLabel(row) {
	for (const v of props.vendors) {
		const entry = props.priceMap[v]?.[row.key];
		if (entry?.vials != null) return `${row.mg} × ${entry.vials} vials`;
	}
	return row.mg;
}

// Precompute lowest price per row key for "best price" highlighting.
const lowestPriceMap = computed(() => {
	const map = new Map();
	for (const row of props.rows) {
		let min = Infinity;
		for (const v of props.vendors) {
			const entry = props.priceMap[v]?.[row.key];
			if (entry != null && entry.price < min) min = entry.price;
		}
		map.set(row.key, min === Infinity ? null : min);
	}
	return map;
});
</script>

<template>
	<div class="toolbar">
		<button
			class="sort-btn"
			@click="cycleSort"
			:title="sortDir === 'asc' ? 'Sort Z→A' : 'Sort A→Z'"
		>
			<span v-if="sortDir === 'asc'">↑ A–Z</span>
			<span v-else-if="sortDir === 'desc'">↓ Z–A</span>
			<span v-else class="sort-idle">↕ Sort</span>
		</button>
	</div>

	<div v-if="pageGroups.length === 0" class="empty">No products match your search.</div>

	<div v-for="group in pageGroups" :key="group.product_name" class="product-section">
		<h3 class="product-title">{{ group.product_name }}</h3>
		<div class="table-wrap">
			<table>
				<thead>
					<tr>
						<th class="col-product">Quantity</th>
						<th v-for="(v, i) in group.vendors" :key="v" class="col-vendor">
							<span
								v-if="group.vendorColors[i]"
								class="vendor-dot"
								:style="{ background: group.vendorColors[i] }"
							></span>
							{{ v.replace(/_/g, ' ') }}
						</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="row in group.variants" :key="row.key">
						<td class="col-product" @click="addRowToCart(row)">
							<span class="col-mg">{{ vialsLabel(row) }}</span>
							<button
								v-if="isRowInCart(row)"
								class="row-remove-btn"
								title="Remove from cart"
								@click.stop="removeRowFromCart(row)"
							>
								✕
							</button>
						</td>
						<td
							v-for="v in group.vendors"
							:key="v"
							class="col-price"
							:class="{
								best:
									priceMap[v]?.[row.key] != null &&
									priceMap[v][row.key].price === lowestPriceMap.get(row.key),
							}"
						>
							<template v-if="priceMap[v]?.[row.key] != null">
								<span
									class="price-wrap"
									@click="cart.addItem(v, row, priceMap[v][row.key])"
								>
									<span class="price-icon">🛒</span>
									${{ priceMap[v][row.key].price.toFixed(2) }}
									<span class="tooltip"
										>{{ priceMap[v][row.key].mg }} ×
										{{ priceMap[v][row.key].vials }} vials</span
									>
								</span>
							</template>
							<span v-else class="na">—</span>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>

	<div class="pagination">
		<span class="page-info">
			{{ pageGroups.length ? (page - 1) * pageSize + 1 : 0 }}–{{
				Math.min(page * pageSize, productGroups.length)
			}}
			of {{ productGroups.length }} products
		</span>
		<div class="page-controls">
			<button :disabled="page === 1" title="First page" @click="page = 1">«</button>
			<button :disabled="page === 1" title="Previous page" @click="page--">‹</button>
			<span class="page-current">Page {{ page }} of {{ totalPages }}</span>
			<button :disabled="page === totalPages" title="Next page" @click="page++">›</button>
			<button :disabled="page === totalPages" title="Last page" @click="page = totalPages">
				»
			</button>
		</div>
	</div>
</template>

<style scoped lang="less">
.toolbar {
	display: flex;
	justify-content: flex-start;
	margin-bottom: 0.5rem;
}

.product-section {
	&:last-of-type {
		margin-bottom: 0;
	}
}

.product-title {
	font-size: 1.25rem;
	font-weight: 700;
	color: var(--text);
	margin: 0 0 0 0.5rem;
}

.table-wrap {
	overflow-x: auto;
	scrollbar-color: var(--border) transparent;
	scrollbar-width: thin;
	border-radius: 12px;
	border: 1px solid var(--border);
}

table {
	width: max-content;
	max-width: 100%;
	border-collapse: separate;
	border-spacing: 0;
	font-size: 0.85rem;
	white-space: nowrap;
	border-radius: 12px;
}

thead {
	position: sticky;
	top: 0;
	z-index: 2;
}

th {
	padding: 0.75rem 1.25rem;
	text-align: left;
	font-size: 0.7rem;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: 0.08em;
	color: var(--text-muted);
	background: var(--surface2);
	border-bottom: 2px solid var(--border);

	&:first-child {
		border-radius: 0;
	}

	&.col-vendor {
		text-align: center;
		white-space: normal;
		overflow-wrap: break-word;
		min-width: 76px;
		max-width: 110px;
		line-height: 1.3;

		.vendor-dot {
			display: inline-block;
			width: 6px;
			height: 6px;
			border-radius: 50%;
			margin-right: 0.4rem;
			vertical-align: middle;
		}
	}

	&.col-product {
		position: sticky;
		left: 0;
		z-index: 3;
		background: color-mix(in srgb, var(--bg) 55%, transparent);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		box-shadow: 2px 0 4px -2px rgba(0, 0, 0, 0.25);
	}
}

.sort-btn {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	padding: 0.35rem 0.7rem;
	background: var(--surface);
	border: 1px solid var(--border);
	border-radius: 6px;
	color: var(--text-muted);
	font-size: 0.75rem;
	font-weight: 600;
	cursor: pointer;
	transition:
		border-color 0.15s,
		color 0.15s;

	&:hover {
		border-color: var(--teal);
		color: var(--teal);
	}

	.sort-idle {
		opacity: 0.7;
	}
}

tbody tr {
	transition: background 0.12s;

	&:hover td {
		background: color-mix(in srgb, var(--teal) 6%, transparent);
	}

	&:nth-child(even) td {
		background: color-mix(in srgb, var(--text) 5%, transparent);
	}

	&:hover:nth-child(even) td {
		background: color-mix(
			in srgb,
			var(--teal) 6%,
			color-mix(in srgb, var(--text) 5%, transparent)
		);
	}

	&:last-child td {
		border-bottom: none;
	}
}

td {
	padding: 0.4rem 1.25rem;
	border-bottom: 1px solid var(--border);
	color: var(--text);
	transition: background 0.12s;

	&.col-product {
		position: sticky;
		left: 0;
		z-index: 1;
		background: color-mix(in srgb, var(--bg) 55%, transparent);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		box-shadow: 2px 0 4px -2px rgba(0, 0, 0, 0.25);
		font-weight: 500;
		font-size: 0.88rem;
		cursor: pointer;

		.col-mg {
			display: inline-block;
			font-size: 0.85rem;
			color: var(--text);
			font-weight: 500;
			vertical-align: middle;
		}

		.row-remove-btn {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			margin-left: 0.5rem;
			background: none;
			border: none;
			color: var(--text-muted);
			cursor: pointer;
			font-size: 0.7rem;
			padding: 0.1rem 0.3rem;
			vertical-align: middle;

			&:hover {
				color: var(--red);
			}
		}
	}

	&.col-price {
		text-align: center;
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.82rem;
		letter-spacing: -0.01em;
	}

	&.best {
		font-size: 0.86rem;
	}
}

.price-wrap {
	position: relative;
	display: inline-flex;
	align-items: center;
	cursor: pointer;
	border-radius: 999px;
	padding: 0.2rem 0.2rem;
	background: var(--surface2);
	border: 1px solid var(--border);
	transition:
		background 0.12s,
		border-color 0.12s;

	.price-icon {
		font-size: 0.72rem;
	}

	.best & {
		background: linear-gradient(135deg, transparent, var(--surface3));
		border-color: var(--teal);
		color: #fff;
	}

	&:hover {
		background: color-mix(in srgb, var(--teal) 16%, transparent);
	}

	.tooltip {
		display: none;
		position: absolute;
		bottom: calc(100% + 8px);
		right: 0;
		background: var(--surface);
		border: 1px solid var(--border);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
		color: var(--text);
		font-size: 0.72rem;
		font-family: inherit;
		font-weight: 400;
		white-space: nowrap;
		padding: 0.35rem 0.7rem;
		border-radius: 6px;
		pointer-events: none;
		z-index: 10;

		&::after {
			content: '';
			position: absolute;
			top: 100%;
			right: 0.7rem;
			border: 5px solid transparent;
			border-top-color: var(--border);
		}
	}

	&:hover .tooltip {
		display: block;
	}
}

.na {
	color: var(--border);
	font-size: 0.78rem;
	font-style: italic;
}

.empty {
	text-align: center;
	padding: 4rem;
	color: var(--text-muted);
	font-size: 0.88rem;
}

// ── Pagination ────────────────────────────────────────────────────
.pagination {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	row-gap: 0.5rem;
	padding: 0.85rem 1.5rem;
	border-top: 2px solid var(--border);
	border-bottom-left-radius: 12px;
	border-bottom-right-radius: 12px;
	background: var(--surface2);
	font-size: 0.8rem;
	color: var(--text-muted);
}

.page-controls {
	display: flex;
	align-items: center;
	gap: 0.3rem;

	.page-current {
		padding: 0 0.4rem;
		white-space: nowrap;
	}

	button {
		min-width: 2.1rem;
		height: 2.1rem;
		padding: 0 0.5rem;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 6px;
		color: var(--text);
		cursor: pointer;
		font-size: 0.8rem;
		font-weight: 500;
		transition:
			border-color 0.15s,
			background 0.15s,
			color 0.15s,
			box-shadow 0.15s;

		&:hover:not(:disabled) {
			border-color: var(--highlight);
			color: var(--highlight);
			box-shadow: 0 0 0 2px var(--highlight-glow);
		}

		&:disabled {
			opacity: 0.3;
			cursor: default;
		}

		&.current {
			background: var(--highlight);
			border-color: var(--highlight);
			color: #fff;
			font-weight: 700;
			box-shadow: 0 2px 8px var(--highlight-glow);
		}
	}
}

@media (max-width: 980px) {
	table {
		font-size: 0.74rem;
	}

	th {
		padding: 0.2rem 0.5rem;
		font-size: 0.6rem;

		&.col-vendor {
			min-width: 56px;
			max-width: 76px;
		}
	}

	td {
		padding: 0.2rem 0.2rem;

		&.col-product {
			font-size: 0.76rem;

			.col-mg {
				font-size: 0.7rem;
				margin-left: 0.3rem;
				padding: 0.01rem 0.1rem;
			}
		}

		&.col-price {
			font-size: 0.72rem;

			.price-wrap {
				padding: 0.1rem 0.45rem;
				gap: 0.2rem;
			}
		}

		&.best {
			font-size: 0.74rem;
		}
	}

	.sort-btn {
		padding: 0.3rem 0.6rem;
		font-size: 0.68rem;
		white-space: nowrap;
	}

	.pagination {
		padding: 0.6rem 0.85rem;
		font-size: 0.72rem;
	}

	.page-controls button {
		min-width: 1.8rem;
		height: 1.8rem;
		padding: 0 0.35rem;
		font-size: 0.72rem;
	}
}
</style>
