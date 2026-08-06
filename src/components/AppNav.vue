<script setup>
import { shallowRef, watch, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import { useTheme } from '../composables/useTheme.js';

const { isDark, toggle } = useTheme();
const route = useRoute();

const drawerOpen = shallowRef(false);

function openDrawer() {
	drawerOpen.value = true;
}

function closeDrawer() {
	drawerOpen.value = false;
}

watch(
	() => route.fullPath,
	() => {
		drawerOpen.value = false;
	},
);

watch(drawerOpen, (isOpen) => {
	document.body.style.overflow = isOpen ? 'hidden' : '';
});

onBeforeUnmount(() => {
	document.body.style.overflow = '';
});
</script>

<template>
	<header>
		<div class="header-inner">
			<button type="button" class="menu-btn" aria-label="Open menu" @click="openDrawer">
				<span></span>
				<span></span>
				<span></span>
			</button>
			<span class="logo-mark">⬡</span>
			<span class="brand">PepPrice</span>
			<nav class="tabs">
				<router-link to="/">Home</router-link>
				<router-link to="/catalog">Catalog</router-link>
				<router-link to="/vendors">Vendors</router-link>
			</nav>
			<label
				class="theme-switch desktop-theme-switch"
				:aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
			>
				<input type="checkbox" :checked="isDark" @change="toggle" />
				<span class="track">
					<span class="thumb">
						<span class="icon">{{ isDark ? '🌙' : '☀️' }}</span>
					</span>
				</span>
			</label>
		</div>

		<div class="drawer-overlay" :class="{ open: drawerOpen }" @click="closeDrawer"></div>

		<aside class="drawer" :class="{ open: drawerOpen }" aria-label="Main menu">
			<div class="drawer-head">
				<span class="drawer-title">Menu</span>
				<button
					type="button"
					class="drawer-close"
					aria-label="Close menu"
					@click="closeDrawer"
				>
					✕
				</button>
			</div>
			<nav class="drawer-links">
				<router-link to="/" @click="closeDrawer">Home</router-link>
				<router-link to="/catalog" @click="closeDrawer">Catalog</router-link>
				<router-link to="/vendors" @click="closeDrawer">Vendors</router-link>
			</nav>
			<div class="drawer-theme">
				<span class="drawer-theme-label">Theme</span>
				<button
					type="button"
					class="drawer-theme-toggle"
					:aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
					@click="toggle"
				>
					{{ isDark ? '🌙 Dark' : '☀️ Light' }}
				</button>
			</div>
		</aside>
	</header>
</template>

<style scoped lang="less">
header {
	position: sticky;
	top: 0;
	z-index: 50;
	border-bottom: 1px solid var(--border);
	padding: 0 2rem;

	// backdrop-filter (like transform/filter) makes an element a containing
	// block for position:fixed descendants — the drawer/drawer-overlay are
	// DOM children of <header>, so putting the blur directly here would trap
	// them inside header's own box instead of the full viewport. Keep the
	// blur on an untransformed pseudo-element instead.
	&::before {
		content: '';
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		z-index: -1;
		background: var(--surface);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
	}
}

.header-inner {
	max-width: 1280px;
	margin: 0 auto;
	height: 56px;
	display: flex;
	align-items: center;
	gap: 0.75rem;
}

.menu-btn {
	display: none;
	width: 34px;
	height: 34px;
	padding: 0;
	background: transparent;
	border: 1px solid var(--border);
	border-radius: 8px;
	align-items: center;
	justify-content: center;
	flex-direction: column;
	gap: 4px;
	cursor: pointer;

	span {
		display: block;
		width: 14px;
		height: 1.5px;
		background: var(--text);
		border-radius: 2px;
	}
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
		transition:
			color 0.15s,
			border-color 0.15s;

		&:hover {
			color: var(--text);
		}

		&.router-link-active {
			color: var(--text);
			border-color: var(--teal);
			background: color-mix(in srgb, var(--teal) 10%, var(--surface));
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
		transition:
			background 0.2s,
			border-color 0.2s,
			box-shadow 0.2s;
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
		transition:
			transform 0.2s,
			background 0.2s,
			box-shadow 0.2s;
	}

	.icon {
		font-size: 11px;
		line-height: 1;
		filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.3));
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

.drawer-overlay {
	position: fixed;
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	background: color-mix(in srgb, #000 45%, transparent);
	backdrop-filter: blur(16px);
	-webkit-backdrop-filter: blur(16px);

	opacity: 0;
	pointer-events: none;
	transition: opacity 0.18s;

	&.open {
		opacity: 1;
		pointer-events: auto;
	}
}

.drawer {
	position: fixed;
	top: 0;
	left: 0;
	height: 100vh;
	width: min(82vw, 320px);
	padding: 1rem 0.85rem;
	border-right: 1px solid var(--border);
	transform: translateX(-102%);
	transition: transform 0.2s ease-out;
	box-shadow: 10px 0 36px rgba(0, 0, 0, 0.45);
	display: flex;
	flex-direction: column;
	gap: 0.85rem;

	// Safari fails to paint backdrop-filter across the full box when the
	// same element also has a transform (as this one does, for the slide-in
	// animation). Put the blur on an untransformed pseudo-element instead.
	&::before {
		content: '';
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		z-index: -1;
		background: var(--surface);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
	}

	&.open {
		transform: translateX(0);
	}
}

.drawer-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding-bottom: 0.5rem;
	border-bottom: 1px solid var(--border);
}

.drawer-title {
	font-size: 0.72rem;
	text-transform: uppercase;
	letter-spacing: 0.07em;
	font-weight: 700;
	color: var(--text-muted);
}

.drawer-close {
	border: none;
	background: transparent;
	color: var(--text-muted);
	font-size: 1rem;
	cursor: pointer;
	padding: 0.1rem 0.4rem;
}

.drawer-links {
	display: flex;
	flex-direction: column;
	gap: 0.4rem;

	a {
		padding: 0.45rem 0.55rem;
		border: 1px solid transparent;
		border-radius: 8px;
		color: var(--text-muted);
		font-size: 0.9rem;
		text-decoration: none;

		&.router-link-active {
			color: var(--text);
			border-color: var(--teal);
			background: color-mix(in srgb, var(--teal) 10%, var(--surface));
		}
	}
}

.drawer-theme {
	margin-top: auto;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding-top: 0.6rem;
	border-top: 1px solid var(--border);
}

.drawer-theme-label {
	font-size: 0.78rem;
	color: var(--text-muted);
}

.drawer-theme-toggle {
	border: 1px solid var(--border);
	background: var(--surface);
	color: var(--text);
	border-radius: 999px;
	padding: 0.28rem 0.7rem;
	font-size: 0.78rem;
	font-weight: 600;
	cursor: pointer;
}

@media (min-width: 901px) {
	.drawer,
	.drawer-overlay {
		display: none;
	}
}

@media (max-width: 900px) {
	header {
		padding: 0 0.85rem;
	}

	.menu-btn {
		display: inline-flex;
	}

	.tabs,
	.desktop-theme-switch {
		display: none;
	}

	.brand {
		font-size: 1.12rem;
	}
}
</style>
