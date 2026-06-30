<script setup>
import { computed, shallowRef, watch } from 'vue';

const props = defineProps({
	rows: { type: Array, required: true },
	vendors: { type: Array, required: true },
	priceMap: { type: Object, required: true },
	pageSize: { type: Number, default: 25 },
	vendorColors: { type: Array, default: () => [] },
});

const page = shallowRef(1);

watch(
	() => props.rows,
	() => {
		page.value = 1;
	},
);

const totalPages = computed(() => Math.max(1, Math.ceil(props.rows.length / props.pageSize)));

const pageRows = computed(() => {
	const start = (page.value - 1) * props.pageSize;
	return props.rows.slice(start, start + props.pageSize);
});

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
	<div class="table-wrap">
		<table>
			<thead>
				<tr>
					<th class="col-product">Product</th>
					<th
						v-for="(v, i) in vendors"
						:key="v"
						class="col-vendor"
						:style="vendorColors[i] ? { color: vendorColors[i] } : {}"
					>
						{{ v.replace(/_/g, ' ') }}
					</th>
				</tr>
			</thead>
			<tbody>
				<tr v-if="pageRows.length === 0">
					<td :colspan="1 + vendors.length" class="empty">
						No products match your search.
					</td>
				</tr>
				<tr v-for="row in pageRows" :key="row.key">
					<td class="col-product">
						{{ row.product_name }} <span class="col-mg">{{ row.mg }}</span>
					</td>
					<td
						v-for="v in vendors"
						:key="v"
						class="col-price"
						:class="{
							best:
								priceMap[v]?.[row.key] != null &&
								priceMap[v][row.key].price === lowestPriceMap.get(row.key),
						}"
					>
						<template v-if="priceMap[v]?.[row.key] != null">
							<span class="price-wrap">
								${{ priceMap[v][row.key].price.toFixed(2) }}
								<span class="tooltip"
									>{{ priceMap[v][row.key].mg }} ×
									{{ priceMap[v][row.key].vials }} vials</span
								>
							</span>
						</template>
						<span v-else class="na">N/A</span>
					</td>
				</tr>
			</tbody>
		</table>
	</div>

	<div class="pagination">
		<span class="page-info">
			{{ (page - 1) * pageSize + 1 }}–{{ Math.min(page * pageSize, rows.length) }} of
			{{ rows.length }}
		</span>
		<div class="page-controls">
			<button :disabled="page === 1" @click="page--">‹</button>
			<button
				v-for="p in totalPages"
				:key="p"
				:class="{ current: p === page }"
				@click="page = p"
			>
				{{ p }}
			</button>
			<button :disabled="page === totalPages" @click="page++">›</button>
		</div>
	</div>
</template>

<style scoped lang="less">
.table-wrap {
	overflow-x: auto;
	flex: 1;
	scrollbar-color: var(--border) transparent;
	scrollbar-width: thin;
}

table {
	width: 100%;
	border-collapse: separate;
	border-spacing: 0;
	font-size: 0.85rem;
	white-space: nowrap;
	min-height: 10rem;
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

	&:first-child { border-radius: 0; }

	&.col-vendor {
		text-align: right;
	}
}

tbody tr {
	transition: background 0.12s;

	&:hover td {
		background: color-mix(in srgb, var(--teal) 5%, var(--surface));
	}

	&:nth-child(even) td {
		background: var(--surface2);
	}

	&:hover:nth-child(even) td {
		background: color-mix(in srgb, var(--teal) 5%, var(--surface2));
	}

	&:last-child td {
		border-bottom: none;
	}
}

td {
	padding: 0.65rem 1.25rem;
	border-bottom: 1px solid var(--border);
	color: var(--text);
	transition: background 0.12s;

	&.col-product {
		font-weight: 500;
		font-size: 0.88rem;

		.col-mg {
			display: inline-block;
			font-size: 0.68rem;
			color: var(--bg);
			background: var(--teal);
			font-weight: 600;
			margin-left: 0.5rem;
			padding: 0.05rem 0.4rem;
			border-radius: 999px;
			vertical-align: middle;
			opacity: 0.85;
		}
	}

	&.col-price {
		text-align: right;
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.82rem;
		letter-spacing: -0.01em;
	}

	&.best {
		color: #5db87a;
		font-weight: 700;
		font-size: 0.86rem;
	}

	[data-theme='light'] &.best {
		color: #3a7d52;
	}
}

.price-wrap {
	position: relative;
	display: inline-block;

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
	align-items: center;
	justify-content: space-between;
	padding: 0.85rem 1.5rem;
	border-top: 2px solid var(--border);
	background: var(--surface2);
	font-size: 0.8rem;
	color: var(--text-muted);
}

.page-controls {
	display: flex;
	gap: 0.3rem;

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
		transition: border-color 0.15s, background 0.15s, color 0.15s, box-shadow 0.15s;

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
</style>
