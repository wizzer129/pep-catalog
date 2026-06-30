<script setup>
const props = defineProps({
	vendors: { type: Array, required: true },
	selected: { type: Object, required: true },
});

const emit = defineEmits(['toggle']);

const CHIP_COLORS = [
	{ border: '#6b9fff', text: '#6b9fff', bg: 'rgba(107,159,255,0.13)' },
	{ border: '#a67de8', text: '#a67de8', bg: 'rgba(166,125,232,0.13)' },
	{ border: '#f5a030', text: '#f5a030', bg: 'rgba(245,160,48,0.13)' },
	{ border: '#4dbf7a', text: '#4dbf7a', bg: 'rgba(77,191,122,0.13)' },
	{ border: '#ff6b6b', text: '#ff6b6b', bg: 'rgba(255,107,107,0.13)' },
	{ border: '#36c5e8', text: '#36c5e8', bg: 'rgba(54,197,232,0.13)' },
	{ border: '#cc8855', text: '#cc8855', bg: 'rgba(204,136,85,0.13)' },
	{ border: '#8bc34a', text: '#8bc34a', bg: 'rgba(139,195,74,0.13)' },
	{ border: '#d46bd4', text: '#d46bd4', bg: 'rgba(212,107,212,0.13)' },
	{ border: '#5b9bd5', text: '#5b9bd5', bg: 'rgba(91,155,213,0.13)' },
];

function chipColor(vendor) {
	const idx = props.vendors.indexOf(vendor) % CHIP_COLORS.length;
	return CHIP_COLORS[idx < 0 ? 0 : idx];
}
</script>

<template>
	<div class="vendor-filter">
		<span class="label">Vendors</span>
		<button
			v-for="vendor in vendors"
			:key="vendor"
			class="chip"
			:class="{ active: selected.has(vendor) }"
			:style="selected.has(vendor) ? {
				borderColor: chipColor(vendor).border,
				color: chipColor(vendor).text,
				background: chipColor(vendor).bg,
			} : {}"
			@click="emit('toggle', vendor)"
		>
			<span class="chip-icon">
				<svg v-if="selected.has(vendor)" viewBox="0 0 12 12" fill="none">
					<circle cx="6" cy="6" r="5.5" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="1"/>
					<path d="M3 6l2 2 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
				<svg v-else viewBox="0 0 12 12" fill="none">
					<circle cx="6" cy="6" r="5.5" stroke="currentColor" stroke-width="1"/>
				</svg>
			</span>
			{{ vendor.replace(/_/g, ' ') }}
		</button>
	</div>
</template>

<style scoped lang="less">
.vendor-filter {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 0.4rem;
	padding: 0.85rem 1.25rem;
	border-bottom: 1px solid var(--border);
	background: var(--surface);
}

.label {
	font-size: 0.7rem;
	font-weight: 600;
	text-transform: uppercase;
	letter-spacing: 0.06em;
	color: var(--text-muted);
	margin-right: 0.25rem;
}

.chip {
	display: inline-flex;
	align-items: center;
	gap: 0.35rem;
	padding: 0.3rem 0.75rem 0.3rem 0.55rem;
	border-radius: 999px;
	border: 1px solid var(--border);
	background: transparent;
	color: var(--text-muted);
	font-size: 0.8rem;
	cursor: pointer;
	transition: border-color 0.15s, color 0.15s, background 0.15s;

	.chip-icon {
		display: flex;
		align-items: center;

		svg {
			width: 12px;
			height: 12px;
		}
	}

	&:hover {
		border-color: var(--teal-dim);
		color: var(--text);
	}

	&.active {
		font-weight: 500;
	}
}
</style>
