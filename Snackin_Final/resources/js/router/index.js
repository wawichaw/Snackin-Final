import { createRouter, createWebHashHistory } from 'vue-router';
import { useAuth } from '../composables/auth';
import LandingView from '../views/LandingView.vue';
import AboutView from '../views/AboutView.vue';
import BiscuitsView from '../views/BiscuitsView.vue';
import BiscuitView from '../views/BiscuitView.vue';
import SaveursView from '../views/SaveursView.vue';
import CommentairesView from '../views/CommentairesView.vue';
import CommandeView from '../views/CommandeView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import AdminBiscuitsView from '../views/AdminBiscuitsView.vue';
import AdminCommandesView from '../views/AdminCommandesView.vue';
import AdminCommentairesView from '../views/AdminCommentairesView.vue';
import AdminBiscuitCreateView from '../views/AdminBiscuitCreateView.vue';
import AdminBiscuitEditView from '../views/AdminBiscuitEditView.vue';
import MessageView from '../views/MessageView.vue';

const routes = [
    { path: '/', name: 'home', component: LandingView, alias: ['/home'] },
    { path: '/about', name: 'about', component: AboutView },
    { path: '/biscuits', name: 'biscuits', component: BiscuitsView },
    { path: '/biscuits/:id', name: 'biscuit.show', component: BiscuitView, props: true },
    { path: '/saveurs', name: 'saveurs', component: SaveursView },
    { path: '/commentaires', name: 'commentaires', component: CommentairesView },
    { path: '/commander', name: 'commander', component: CommandeView, meta: { requiresAuth: true } },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },
    { path: '/admin/biscuits', name: 'admin.biscuits', component: AdminBiscuitsView, meta: { requiresAuth: true, adminOnly: true } },
    { path: '/admin/biscuits/create', name: 'admin.biscuits.create', component: AdminBiscuitCreateView, meta: { requiresAuth: true, adminOnly: true } },
    { path: '/admin/biscuits/:id/edit', name: 'admin.biscuits.edit', component: AdminBiscuitEditView, meta: { requiresAuth: true, adminOnly: true } },
    { path: '/admin/commandes', name: 'admin.commandes', component: AdminCommandesView, meta: { requiresAuth: true, adminOnly: true } },
    { path: '/admin/commentaires', name: 'admin.commentaires', component: AdminCommentairesView, meta: { requiresAuth: true, adminOnly: true } },
    { path: '/:pathMatch(.*)*', name: 'fallback', component: MessageView, props: { title: 'Page Vue', message: 'Route non trouvee, mais la SPA Vue est montee.' } },
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

router.beforeEach((to, from, next) => {
    const { user, token } = useAuth();
    const isAuth = !!(user.value || token.value);
    const isAdmin = !!(user.value && (user.value.is_admin || user.value.role === 'admin'));

    if (to.meta?.requiresAuth && !isAuth) {
        return next({ name: 'login', query: { redirect: to.fullPath } });
    }
    if (to.meta?.adminOnly && !isAdmin) {
        return next({ name: 'home', query: { forbidden: '1' } });
    }
    // Rediriger les admins qui essaient de commander vers la gestion des commandes
    if (to.name === 'commander' && isAdmin) {
        return next({ name: 'admin.commandes' });
    }
    if ((to.name === 'login' || to.name === 'register') && isAuth) {
        return next({ name: 'home' });
    }
    return next();
});

export default router;
