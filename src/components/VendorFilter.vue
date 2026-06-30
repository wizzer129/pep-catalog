<script setup>
defineProps({
	vendors: { type: Array, required: true },
	selected: { type: Object, required: true },
});

const emit = defineEmits(['toggle']);
</script>

<template>
	<div class="vendor-filter">
		<button
			v-for="vendor in vendors"
			:key="vendor"
			class="chip"
			:class="{ active: selected.has(vendor) }"
			@click="emit('toggle', vendor)"
		>
			{{ vendor.replace(/_/g, ' ') }}
		</button>
	</div>
</template>

<style scoped lang="less">
.vendor-filter {
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem;
	padding: 1rem 1.5rem;
	border-bottom: 1px solid var(--border);
	background: var(--surface);
}

.chip {
	padding: 0.3rem 0.85rem;
	border-radius: 999px;
	border: 1px solid var(--border);
	background: var(--surface2);
	color: var(--text-muted);
	font-size: 0.8rem;
	cursor: pointer;
	transition: all 0.15s;

	&:hover {
		border-color: var(--teal-dim);
		color: var(--text);
	}

	&.active {
		background: var(--teal);
		border-color: var(--teal);
		color: #0d1117;
		font-weight: 600;
	}
}
</style>
