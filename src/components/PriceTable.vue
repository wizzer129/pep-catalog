<script setup>
import { computed, shallowRef, watch } from 'vue';

const props = defineProps({
	rows: { type: Array, required: true },
	vendors: { type: Array, required: true },
	priceMap: { type: Object, required: true },
	pageSize: { type: Number, default: 25 },
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
					<th v-for="v in vendors" :key="v" class="col-vendor">
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
					<td class="col-product">{{ row.product_name }}</td>
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
							${{ priceMap[v][row.key].price.toFixed(2) }}
							<span class="spec">/ {{ priceMap[v][row.key].spec }}</span>
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
}

table {
	width: 100%;
	border-collapse: collapse;
	font-size: 0.85rem;
	white-space: nowrap;
}

thead {
	position: sticky;
	top: 0;
	z-index: 2;
	background: var(--surface);
}

th {
	padding: 0.65rem 1rem;
	text-align: left;
	font-size: 0.75rem;
	font-weight: 600;
	text-transform: uppercase;
	letter-spacing: 0.05em;
	color: var(--text-muted);
	border-bottom: 1px solid var(--border);

	&.col-vendor {
		text-align: right;
	}
}

td {
	padding: 0.55rem 1rem;
	border-bottom: 1px solid var(--border);
	color: var(--text);

	&.col-product {
		font-weight: 500;
	}
	&.col-price {
		text-align: right;
		font-family: 'IBM Plex Mono', monospace;

		.spec {
			font-size: 0.75rem;
			color: var(--text-muted);
			font-family: inherit;
		}
	}
	&.best {
		color: var(--teal);
		font-weight: 600;
	}
}

.na {
	color: var(--border);
}

.text-muted {
	color: var(--text-muted);
}

.empty {
	text-align: center;
	padding: 3rem;
	color: var(--text-muted);
}

tr:hover td {
	background: var(--surface);
}

// ── Pagination ────────────────────────────────────────────────────
.pagination {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0.75rem 1.5rem;
	border-top: 1px solid var(--border);
	background: var(--surface);
	font-size: 0.8rem;
	color: var(--text-muted);
}

.page-controls {
	display: flex;
	gap: 0.25rem;

	button {
		min-width: 2rem;
		padding: 0.25rem 0.5rem;
		background: var(--surface2);
		border: 1px solid var(--border);
		border-radius: 4px;
		color: var(--text);
		cursor: pointer;
		font-size: 0.8rem;
		transition: border-color 0.15s;

		&:hover:not(:disabled) {
			border-color: var(--teal-dim);
		}
		&:disabled {
			opacity: 0.35;
			cursor: default;
		}
		&.current {
			background: var(--teal);
			border-color: var(--teal);
			color: #0d1117;
			font-weight: 600;
		}
	}
}
</style>
