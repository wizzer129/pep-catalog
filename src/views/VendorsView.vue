<script setup>
import { useCatalogStore } from '../stores/catalog';

const catalog = useCatalogStore();

const ICONS = {
	website: '🌐',
	whatsapp: '💬',
	whatsapp_telegram: '💬',
	telegram: '✈️',
	discord: '🎮',
	email: '✉️',
	representative: '👤',
	person: '👤',
	payment_methods: '💳',
	shipping_time: '🚚',
};
</script>

<template>
	<div v-if="catalog.loading" class="state-msg">Loading vendors…</div>
	<div v-else-if="catalog.error" class="state-msg error">{{ catalog.error }}</div>
	<div v-else class="vendors">
		<div v-for="(vendor, key) in catalog.suppliers" :key="key" class="card">
			<h2 class="name">{{ vendor.name || key.replace(/_/g, ' ') }}</h2>
			<p class="product-count">{{ vendor.products.length }} products</p>
			<dl class="contact">
				<template v-for="(val, field) in vendor.contact" :key="field">
					<dt>{{ ICONS[field] || '•' }} {{ field.replace(/_/g, ' ') }}</dt>
					<dd>
						<a v-if="field === 'website'" :href="val" target="_blank" rel="noopener">{{
							val
						}}</a>
						<a v-else-if="field === 'email'" :href="`mailto:${val}`">{{ val }}</a>
						<a
							v-else-if="field === 'whatsapp' || field === 'whatsapp_telegram'"
							:href="`https://wa.me/${String(val).replace(/\D/g, '')}`"
							target="_blank"
							rel="noopener"
							>{{ val }}</a
						>
						<span v-else>{{ val }}</span>
					</dd>
				</template>
			</dl>
		</div>
	</div>
</template>

<!-- ponytail: state-msg duplicated from CatalogView, extract if a third view needs it -->

<style scoped lang="less">
.state-msg {
	padding: 3rem;
	text-align: center;
	color: var(--text-muted);
	font-size: 0.9rem;
	&.error {
		color: var(--red);
	}
}

.vendors {
	display: grid;
	grid-template-columns: 1fr 1fr 1fr 1fr;
	gap: 0.75rem;

	@media (max-width: 640px) {
		grid-template-columns: 1fr;
	}
}

.card {
	background: var(--surface);
	border: 1px solid var(--border);
	border-radius: 8px;
	padding: 1.25rem 1em;
}

.name {
	font-size: 1rem;
	font-weight: 700;
	color: var(--text);
	margin-bottom: 0.15rem;
}

.product-count {
	font-size: 0.78rem;
	color: var(--teal);
	margin-bottom: 1rem;
}

.contact {
	display: grid;
	grid-template-columns: auto 1fr;
	gap: 0.3rem 1rem;
	font-size: 0.82rem;

	dt {
		color: var(--text-muted);
		white-space: nowrap;
		text-transform: capitalize;
	}

	dd {
		color: var(--text);
		word-break: break-all;

		a {
			color: var(--teal);
			text-decoration: none;
			&:hover {
				text-decoration: underline;
			}
		}
	}
}
</style>
