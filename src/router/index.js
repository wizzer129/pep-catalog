import { createRouter, createWebHistory } from 'vue-router';

const routes = [
	{
		path: '/',
		name: 'home',
		component: () => import('../views/HomeView.vue'),
	},
	{
		path: '/catalog',
		name: 'catalog',
		component: () => import('../views/CatalogView.vue'),
	},
	{
		path: '/vendors',
		name: 'vendors',
		component: () => import('../views/VendorsView.vue'),
	},
];

export default createRouter({
	history: createWebHistory(),
	routes,
	scrollBehavior: () => ({ top: 0 }),
});
