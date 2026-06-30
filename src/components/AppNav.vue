<script setup>
import { useTheme } from '../composables/useTheme.js';
const { isDark, toggle } = useTheme();
</script>

<template>
	<header>
		<div class="header-inner">
			<span class="logo-mark">⬡</span>
			<span class="brand">PepPrice</span>
			<nav class="tabs">
				<router-link to="/">Home</router-link>
				<router-link to="/catalog">Catalog</router-link>
				<router-link to="/vendors">Vendors</router-link>
			</nav>
			<label class="theme-switch" :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'">
				<input type="checkbox" :checked="isDark" @change="toggle" />
				<span class="track">
					<span class="thumb">
						<span class="icon">{{ isDark ? '🌙' : '☀️' }}</span>
					</span>
				</span>
			</label>
		</div>
	</header>
</template>

<style scoped lang="less">
header {
	background: var(--surface);
	border-bottom: 1px solid var(--border);
	padding: 0 2rem;
}

.header-inner {
	max-width: 1280px;
	margin: 0 auto;
	height: 56px;
	display: flex;
	align-items: center;
	gap: 0.75rem;
}

.logo-mark {
	font-size: 1.5rem;
	color: var(--teal);
	line-height: 1;
}

.brand {
	font-size: 1.25rem;
	font-weight: 700;
	color: var(--text);
	letter-spacing: -0.02em;
}

.tabs {
	margin-left: auto;
	display: flex;
	gap: 0.25rem;

	a {
		padding: 0.3rem 0.9rem;
		border: 1px solid transparent;
		border-radius: 6px;
		color: var(--text-muted);
		font-size: 0.85rem;
		text-decoration: none;
		transition: color 0.15s, border-color 0.15s;

		&:hover { color: var(--text); }

		&.router-link-active {
			color: var(--teal);
			border-color: var(--teal);
		}
	}
}

.theme-switch {
	display: flex;
	align-items: center;
	cursor: pointer;
	margin-left: 0.5rem;

	input {
		position: absolute;
		opacity: 0;
		width: 0;
		height: 0;
	}

	.track {
		position: relative;
		width: 50px;
		height: 28px;
		background: var(--surface2);
		border: 1.5px solid var(--border);
		border-radius: 999px;
		box-shadow:
			inset 0 2px 4px rgba(0, 0, 0, 0.25),
			0 1px 0 rgba(255, 255, 255, 0.06);
		transition: background 0.2s, border-color 0.2s, box-shadow 0.2s;
	}

	.thumb {
		position: absolute;
		top: 3px;
		left: 3px;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: var(--text-muted);
		border: 1px solid rgba(0, 0, 0, 0.15);
		box-shadow:
			0 2px 4px rgba(0, 0, 0, 0.35),
			0 1px 1px rgba(0, 0, 0, 0.2);
		display: flex;
		align-items: center;
		justify-content: center;
		transition: transform 0.2s, background 0.2s, box-shadow 0.2s;
	}

	.icon {
		font-size: 11px;
		line-height: 1;
		filter: drop-shadow(0 1px 1px rgba(0,0,0,0.3));
	}

	input:checked ~ .track {
		background: var(--teal-dim);
		border-color: var(--teal);
		box-shadow:
			inset 0 2px 4px rgba(0, 0, 0, 0.2),
			0 0 6px rgba(0, 212, 184, 0.25);
	}

	input:checked ~ .track .thumb {
		transform: translateX(22px);
		background: var(--text);
		box-shadow:
			0 2px 5px rgba(0, 0, 0, 0.4),
			0 1px 1px rgba(0, 0, 0, 0.2);
	}
}
</style>
