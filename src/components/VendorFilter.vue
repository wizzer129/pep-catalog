<script setup>
import { shallowRef } from 'vue';
import { vendorColor } from '../constants/vendorColors.js';

const props = defineProps({
	vendors: { type: Array, required: true },
	selected: { type: Object, required: true },
});

const emit = defineEmits(['toggle']);

const expanded = shallowRef(false);

function chipColor(vendor) {
	return vendorColor(props.vendors, vendor);
}
</script>

<template>
	<div class="vendor-filter-wrap">
		<div class="vendor-filter" :class="{ expanded }">
			<button
				v-for="vendor in vendors"
				:key="vendor"
				class="chip"
				:class="{ active: selected.has(vendor) }"
				@click="emit('toggle', vendor)"
			>
				<span class="chip-dot" :style="{ background: chipColor(vendor) }"></span>
				{{ vendor.replace(/_/g, ' ') }}
				<span v-if="selected.has(vendor)" class="chip-x">✕</span>
			</button>
		</div>
		<button type="button" class="expand-toggle" @click="expanded = !expanded">
			{{ expanded ? 'Show less' : `Show all (${vendors.length})` }}
		</button>
		<span class="selected-count">{{ selected.size }} selected</span>
	</div>
</template>

<style scoped lang="less">
.vendor-filter-wrap {
	.expand-toggle,
	.selected-count {
		display: none;
	}
}

.vendor-filter {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 0.5rem;
	padding: 0.5rem 0;
}

.chip {
	display: inline-flex;
	align-items: center;
	gap: 0.4rem;
	padding: 0.35rem 0.7rem;
	border-radius: 999px;
	border: 1px solid var(--border);
	background: color-mix(in srgb, var(--surface) 70%, transparent);
	color: var(--text-muted);
	font-size: 0.8rem;
	opacity: 0.55;
	cursor: pointer;
	transition:
		opacity 0.15s,
		background 0.15s,
		color 0.15s;

	.chip-dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.chip-x {
		font-size: 0.65rem;
		color: var(--text-muted);
		margin-left: 0.1rem;
	}

	&:hover {
		opacity: 0.2;
	}

	&.active {
		opacity: 1;
		color: var(--text);
		background: color-mix(in srgb, var(--surface) 90%, transparent);
	}
}

@media (max-width: 640px) {
	.vendor-filter-wrap {
		position: relative;
		text-align: center;

		.expand-toggle {
			display: block;
			margin: 0 auto;
			padding: 0.3rem 0.9rem;
			background: var(--surface);
			border: 1px solid var(--border);
			border-radius: 999px;
			color: var(--teal);
			font-size: 0.76rem;
			font-weight: 600;
			cursor: pointer;
		}

		.selected-count {
			display: block;
			margin-top: 0.35rem;
			font-size: 0.72rem;
			color: var(--text-muted);
		}
	}

	.vendor-filter {
		max-height: 5.6rem;
		overflow: hidden;
		position: relative;
		margin-bottom: 0.5rem;

		&::after {
			content: '';
			position: absolute;
			left: 0;
			right: 0;
			bottom: 0;
			height: 1.5rem;
			background: linear-gradient(to bottom, transparent, var(--bg));
			pointer-events: none;
		}

		&.expanded {
			max-height: none;

			&::after {
				display: none;
			}
		}
	}
}
</style>
