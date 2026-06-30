<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCatalogStore } from '../stores/catalog';

const STORAGE_KEY = 'pepprice:selected-vendors';

const catalog = useCatalogStore();
const router = useRouter();

const selected = ref(new Set());

function toggle(key) {
	const s = new Set(selected.value);
	if (s.has(key)) s.delete(key);
	else s.add(key);
	selected.value = s;
}

function compare() {
	localStorage.setItem(STORAGE_KEY, JSON.stringify([...selected.value]));
	router.push('/catalog');
}

const hasSelection = computed(() => selected.value.size > 0);

const AVATAR_COLORS = [
	{ bg: '#6b9fff', fg: '#0d1117' },
	{ bg: '#a67de8', fg: '#0d1117' },
	{ bg: '#f5a030', fg: '#0d1117' },
	{ bg: '#4dbf7a', fg: '#0d1117' },
	{ bg: '#ff6b6b', fg: '#0d1117' },
	{ bg: '#36c5e8', fg: '#0d1117' },
	{ bg: '#cc8855', fg: '#0d1117' },
	{ bg: '#8bc34a', fg: '#0d1117' },
	{ bg: '#d46bd4', fg: '#0d1117' },
	{ bg: '#5b9bd5', fg: '#0d1117' },
];

const vendorKeys = computed(() => Object.keys(catalog.suppliers));

function avatarColor(key) {
	const idx = vendorKeys.value.indexOf(key) % AVATAR_COLORS.length;
	return AVATAR_COLORS[idx < 0 ? 0 : idx];
}

function initials(key) {
	return key
		.replace(/_/g, ' ')
		.split(' ')
		.map((w) => w[0])
		.join('')
		.slice(0, 2)
		.toUpperCase();
}

function displayName(key, vendor) {
	return vendor.name
		? vendor.name.replace(/\b\w/g, (c) => c.toUpperCase())
		: key.replace(/_/g, ' ');
}
</script>

<template>
	<div class="home">
		<div class="hero">
			<h1>Peptide Vendors</h1>
			<p class="sub">Select vendors to compare pricing side by side.</p>
		</div>

		<div v-if="catalog.loading" class="state-msg">Loading…</div>
		<div v-else-if="catalog.error" class="state-msg error">{{ catalog.error }}</div>

		<template v-else>
			<div class="grid">
				<label
					v-for="(vendor, key) in catalog.suppliers"
					:key="key"
					class="card"
					:class="{ selected: selected.has(key) }"
					:style="{
						borderColor: avatarColor(key).bg + '55',
						background: avatarColor(key).bg + '0d',
					}"
				>
					<input
						type="checkbox"
						class="cb"
						:checked="selected.has(key)"
						@change="toggle(key)"
					/>
					<div
						class="avatar"
						:style="{ background: avatarColor(key).bg, color: avatarColor(key).fg }"
					>
						{{ initials(key) }}
					</div>
					<div class="vendor-name">{{ displayName(key, vendor) }}</div>
					<div
						class="contact"
						v-if="
							vendor.contact?.representative &&
							vendor.contact.representative !== 'N/A'
						"
					>
						<span class="contact-label">Contact</span>
						<span class="contact-name">{{ vendor.contact.representative }}</span>
					</div>
					<div class="contact placeholder" v-else>
						<span class="contact-label">Contact</span>
						<span class="contact-name muted">—</span>
					</div>
				</label>
			</div>

			<div class="footer-bar">
				<span class="selection-count">
					{{ selected.size }} vendor{{ selected.size === 1 ? '' : 's' }} selected
				</span>
				<button class="cta" :disabled="!hasSelection" @click="compare">
					Compare vendors <span class="arrow">→</span>
				</button>
			</div>
		</template>
	</div>
</template>

<style scoped lang="less">
.home {
	max-width: 1100px;
	margin: 0 auto;
	padding: 2.5rem 1.5rem 6rem;
}

.hero {
	margin-bottom: 2rem;

	h1 {
		font-size: 1.75rem;
		font-weight: 700;
		color: var(--text);
		letter-spacing: -0.02em;
		margin-bottom: 0.35rem;
	}

	.sub {
		color: var(--text-muted);
		font-size: 0.9rem;
	}
}

.state-msg {
	padding: 3rem;
	text-align: center;
	color: var(--text-muted);
	font-size: 0.9rem;
	&.error {
		color: var(--red);
	}
}

.grid {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 1rem;

	@media (max-width: 900px) {
		grid-template-columns: repeat(2, 1fr);
	}
	@media (max-width: 520px) {
		grid-template-columns: 1fr;
	}
}

.card {
	position: relative;
	background: var(--surface);
	border: 2px solid var(--border);
	border-radius: 12px;
	padding: 1.25rem 1.25rem 1rem;
	cursor: pointer;
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
	transition:
		border-color 0.2s,
		box-shadow 0.2s,
		transform 0.2s,
		filter 0.2s;
	user-select: none;

	&:hover {
		transform: translateY(-5px);
		box-shadow: 0 10px 28px rgba(0, 0, 0, 0.35);
	}

	&.selected {
		transform: translateY(-5px);
		box-shadow: 0 0 0 3px var(--highlight-glow), 0 10px 28px rgba(0, 0, 0, 0.35);
		filter: brightness(1.08);
	}
}

.cb {
	position: absolute;
	top: 0.75rem;
	right: 0.75rem;
	width: 17px;
	height: 17px;
	accent-color: var(--highlight);
	cursor: pointer;
}

.avatar {
	width: 44px;
	height: 44px;
	border-radius: 10px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 0.85rem;
	font-weight: 700;
	letter-spacing: 0.02em;
	flex-shrink: 0;
}

.vendor-name {
	font-size: 0.95rem;
	font-weight: 600;
	color: var(--text);
	line-height: 1.3;
	padding-right: 1.5rem;
}

.contact {
	display: flex;
	flex-direction: column;
	gap: 0.1rem;
	margin-top: auto;
	padding-top: 0.6rem;
	border-top: 1px solid var(--border);

	.contact-label {
		font-size: 0.68rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-muted);
	}

	.contact-name {
		font-size: 0.82rem;
		color: var(--text);
		font-weight: 500;

		&.muted {
			color: var(--text-muted);
		}
	}
}

.footer-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background: var(--surface);
	border-top: 1px solid var(--border);
	padding: 1rem 2rem;
	display: flex;
	align-items: center;
	justify-content: space-around;
	z-index: 10;
	backdrop-filter: blur(8px);
}

.selection-count {
	font-size: 0.85rem;
	color: var(--text-muted);
}

.cta {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	background: var(--highlight);
	color: #fff;
	border: none;
	border-radius: 8px;
	padding: 0.6rem 1.4rem;
	font-size: 0.9rem;
	font-weight: 600;
	cursor: pointer;
	transition:
		opacity 0.15s,
		transform 0.15s;

	&:hover:not(:disabled) {
		opacity: 0.88;
		transform: translateX(2px);
		box-shadow: 0 0 16px var(--highlight-glow);
	}

	&:disabled {
		opacity: 0.35;
		cursor: default;
		transform: none;
	}

	.arrow {
		font-size: 1.1rem;
		transition: transform 0.15s;
	}

	&:hover:not(:disabled) .arrow {
		transform: translateX(3px);
	}
}
</style>
