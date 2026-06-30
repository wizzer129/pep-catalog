<script setup>
const model = defineModel({ type: String, default: '' });
const emit = defineEmits(['filter']);
</script>

<template>
	<div class="search-bar">
		<div class="input-wrap">
			<svg class="icon-search" viewBox="0 0 20 20" fill="none">
				<circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" stroke-width="1.5" />
				<path
					d="M13 13l3.5 3.5"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
				/>
			</svg>
			<input type="text" placeholder="Search products…" v-model="model" />
			<button v-if="model" class="clear" @click="model = ''">✕</button>
		</div>
		<button class="filter-btn" @click="emit('filter')">
			<svg viewBox="0 0 20 20" fill="none">
				<path
					d="M3 5h14M6 10h8M9 15h2"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
				/>
			</svg>
			Filter
		</button>
	</div>
</template>

<style scoped lang="less">
.search-bar {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	padding: 0.75rem 1.5rem;
	border-bottom: 1px solid var(--border);
	background: var(--bg);
}

.input-wrap {
	position: relative;
	flex: 1;
	display: flex;
	align-items: center;

	input {
		width: 100%;
		padding: 0.5rem 2.25rem;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 6px;
		color: var(--text);
		font-size: 0.875rem;
		outline: none;
		transition: border-color 0.15s;

		&::placeholder {
			color: var(--text-muted);
		}
		&:focus {
			border-color: var(--teal-dim);
		}
	}
}

.icon-search {
	position: absolute;
	left: 0.65rem;
	width: 15px;
	height: 15px;
	color: var(--text-muted);
	pointer-events: none;
}

.clear {
	position: absolute;
	right: 0.65rem;
	background: none;
	border: none;
	color: var(--text-muted);
	cursor: pointer;
	font-size: 0.75rem;
	line-height: 1;

	&:hover {
		color: var(--text);
	}
}

.filter-btn {
	display: flex;
	align-items: center;
	gap: 0.4rem;
	padding: 0.5rem 1rem;
	background: var(--surface);
	border: 1px solid var(--border);
	border-radius: 6px;
	color: var(--text);
	font-size: 0.875rem;
	cursor: pointer;
	white-space: nowrap;
	transition: border-color 0.15s;

	svg {
		width: 15px;
		height: 15px;
		color: var(--text-muted);
	}

	&:hover {
		border-color: var(--teal-dim);
	}
}
</style>
