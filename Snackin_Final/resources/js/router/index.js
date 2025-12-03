import { createRouter, createWebHashHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import AboutView from '../views/AboutView.vue';
import MessageView from '../views/MessageView.vue';

const routes = [
    { path: '/', name: 'home', component: HomeView },
    { path: '/about', name: 'about', component: AboutView },
    { path: '/:pathMatch(.*)*', name: 'fallback', component: MessageView, props: { title: 'Page Vue', message: 'Route non trouvée, mais la SPA Vue est montée.' } },
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

export default router;
