# PepPrice — Agent Guide

Single-page Vue 3 app for comparing peptide prices across multiple suppliers.

## Stack

- **Vue 3** with `<script setup>` Composition API
- **Pinia** for global state (setup-store style)
- **Less** for styles (scoped per component, global tokens in `src/assets/`)
- **Vite** for dev/build
- **Vitest** + `@vue/test-utils` for unit tests
- **oxlint + ESLint + Prettier** for linting and formatting

## Dev commands

```bash
npm run dev          # start dev server
npm run build        # production build
npm run preview      # preview production build
npm run test:unit    # run unit tests
npm run lint         # oxlint + eslint (auto-fix)
npm run format       # prettier
```

Node ≥ 22.18 is required. The project uses a `mise`-managed Node 25 install;
nvm's Node 20 is too old for the tooling. Always invoke npm via the mise-managed
binary at `/home/alazo/.local/share/mise/installs/node/25.9.0/bin/npm`.

## Project layout

```
src/
  assets/
    base.less       # design tokens (Less vars + CSS custom props, dark/light themes)
    main.less       # entry stylesheet — imports normalize.css then base.less
  catalog/
    peptide_suppliers.json   # raw price data — source of truth, do not generate
  components/
    VendorFilter.vue   # vendor toggle chips (props: vendors[], selected Object)
    SearchBar.vue      # search input using defineModel(); emits: filter
    PriceTable.vue     # paginated price matrix; highlights lowest price per row
  stores/
    catalog.js         # Pinia setup store; exposes vendorKeys, productRows, priceMap
  views/
    CatalogView.vue    # orchestrates filter + search + table; owns vendor selection state
  App.vue              # shell: header + <CatalogView />
  main.js              # app entry; mounts Vue, registers Pinia
```

## Data model

`peptide_suppliers.json` is keyed by vendor name. Each vendor has:

```jsonc
{
  "VendorName": {
    "name": "...",
    "contact": { "website": "...", "whatsapp": "...", ... },
    "products": [
      { "product_name": "HGH", "nick_name": "H10", "specification": "10iu*10vials", "price_per_kit": 50.0 }
    ]
  }
}
```

The store derives:
- `vendorKeys` — ordered array of vendor names
- `productRows` — deduplicated, sorted list of `{ key, product_name, nick_name, specification }`; row key is `"product_name||specification"`
- `priceMap` — `priceMap[vendorKey][rowKey] = price_per_kit`

## Design tokens

All tokens live in `src/assets/base.less` as Less variables (`@teal`, `@bg`, etc.)
and are exposed as CSS custom properties (`--teal`, `--bg`, etc.) on `:root`.

Dark theme is the default. Light theme applies via `[data-theme='light']` or
`@media (prefers-color-scheme: light)` when `data-theme` is not pinned.
To toggle at runtime: `document.documentElement.dataset.theme = 'light' | 'dark'`.

## Reactivity conventions

- Use `shallowRef` for primitives and values that are replaced wholesale.
- Use `ref` for objects/arrays that are mutated in place and need deep tracking.
- Use `reactive` for objects/Sets mutated in place (e.g. `selectedVendors`).
- All derivations must be `computed`; never compute in templates or watchers.
- `import` statements must appear at the top of `<script setup>` — never after first use.

## Component conventions

- All styles use `<style scoped lang="less">`.
- v-model in child components uses `defineModel()` (Vue 3.4+).
- Prop type for a `reactive(new Set())` is `Object`, not `Set` (Proxy fails `instanceof`).
- No TypeScript — project is plain JS; keep it that way unless asked to migrate.

## What not to change

- `src/catalog/peptide_suppliers.json` — edit only when adding real supplier data.
- `src/assets/base.less` token values — visual identity; confirm with user before changing colors.
