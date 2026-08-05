<script setup>
import { shallowRef, computed } from 'vue';

const selected = defineModel({ type: Array, default: () => [] });

const props = defineProps({
	options: { type: Array, required: true },
});

const query = shallowRef('');
const open = shallowRef(false);

const suggestions = computed(() => {
	const q = query.value.trim().toLowerCase();
	return props.options.filter(
		(o) => !selected.value.includes(o) && (!q || o.toLowerCase().includes(q)),
	);
});

function pick(name) {
	selected.value = [...selected.value, name];
}

function remove(name) {
	selected.value = selected.value.filter((s) => s !== name);
}

function onBlur() {
	setTimeout(() => {
		open.value = false;
	}, 150);
}
</script>

<template>
	<div class="search-bar">
		<text>Search Peptides</text>
		<div class="combobox" :class="{ open }">
			<div class="input-row">
				<button v-for="name in selected" :key="name" class="chip" @click="remove(name)">
					{{ name }} ✕
				</button>
				<input
					v-model="query"
					type="text"
					:placeholder="selected.length ? '' : 'Search products…'"
					@focus="open = true"
					@blur="onBlur"
				/>
			</div>

			<ul v-if="open && suggestions.length" class="dropdown">
				<li v-for="name in suggestions" :key="name" @mousedown.prevent="pick(name)">
					{{ name }}
				</li>
			</ul>
		</div>
	</div>
</template>

<style scoped lang="less">
.search-bar {
	padding: 0.75rem 0rem;
}

.combobox {
	position: relative;
}

.input-row {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 0.35rem;
	padding: 0.4rem 0.6rem;
	background: var(--surface);
	border: 1px solid var(--border);
	border-radius: 6px;
	transition: border-color 0.15s;
	cursor: text;

	.combobox.open & {
		border-color: var(--teal-dim);
	}

	input {
		flex: 1;
		min-width: 120px;
		background: none;
		border: none;
		outline: none;
		color: var(--text);
		font-size: 0.875rem;

		&::placeholder {
			color: var(--text-muted);
		}
	}
}

.chip {
	display: inline-flex;
	align-items: center;
	gap: 0.3rem;
	padding: 0.25rem 0.7rem;
	background: var(--teal);
	color: #fff;
	font-size: 0.8rem;
	border: none;
	border-radius: 999px;
	cursor: pointer;
	white-space: nowrap;
	transition: filter 0.15s;

	&:hover {
		filter: brightness(1.1);
	}
}

.dropdown {
	position: absolute;
	top: calc(100% + 4px);
	left: 0;
	right: 0;
	max-height: 240px;
	overflow-y: auto;
	background: var(--surface2);
	border: 1px solid var(--border);
	border-radius: 6px;
	z-index: 20;
	list-style: none;
	margin: 0;
	padding: 0.25rem 0;

	li {
		padding: 0.45rem 0.75rem;
		font-size: 0.875rem;
		color: var(--text);
		cursor: pointer;

		&:hover {
			background: var(--surface);
			color: var(--teal);
		}
	}
}
</style>
