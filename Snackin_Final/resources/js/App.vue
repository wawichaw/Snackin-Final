<template>
  <div class="vue-shell">
    <nav class="snk-nav">
      <div class="snk-container">
        <RouterLink class="snk-logo" to="/">
          <img :src="getImageUrl('/Contenu/img/snackin-logo.png')" alt="Snackin logo" style="width:36px;height:36px;object-fit:contain">
          <strong>Snackin'</strong>
        </RouterLink>
        <span class="snk-badge">Fait à Montréal</span>

        <div class="snk-spacer"></div>
        <RouterLink to="/">Accueil</RouterLink>
        <RouterLink to="/biscuits">Biscuits</RouterLink>
        <RouterLink to="/commander">Commander</RouterLink>
        <RouterLink to="/commentaires">Commentaires</RouterLink>
        <RouterLink to="/about">À propos</RouterLink>

        <div class="snk-spacer"></div>
        <SearchBar v-if="showSearch" class="search-bar-nav" />
        <template v-if="!user">
          <RouterLink to="/login">Se connecter</RouterLink>
          <RouterLink to="/register">S'inscrire</RouterLink>
        </template>
        <template v-else>
          <RouterLink v-if="isAdmin" to="/admin">Admin</RouterLink>
          <div class="user-menu" @mouseenter="showDropdown = true" @mouseleave="showDropdown = false">
            <span class="user-name">{{ user.name }}</span>
            <div v-if="showDropdown" class="user-dropdown">
              <RouterLink to="/admin" v-if="isAdmin">Tableau de bord</RouterLink>
              <RouterLink to="/admin/biscuits" v-if="isAdmin">Biscuits</RouterLink>
              <RouterLink to="/admin/saveurs" v-if="isAdmin">Saveurs</RouterLink>
              <RouterLink to="/admin/commandes" v-if="isAdmin">Commandes</RouterLink>
              <RouterLink to="/admin/commentaires" v-if="isAdmin">Commentaires</RouterLink>
              <button type="button" @click="doLogout">Se déconnecter</button>
            </div>
          </div>
        </template>
      </div>
    </nav>

    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRouter, RouterLink, useRoute } from 'vue-router';
import SearchBar from './components/SearchBar.vue';
import { useAuth } from './composables/auth';

const router = useRouter();
const route = useRoute();
const { user, logout } = useAuth();
const isAdmin = computed(() => !!(user.value && (user.value.is_admin || user.value.role === 'admin')));
const showSearch = computed(() => {
  const searchRoutes = ['/biscuits', '/'];
  return searchRoutes.includes(route.path);
});
const showDropdown = ref(false);

const doLogout = async () => {
  await logout();
  router.push('/');
};

// Fonction pour obtenir l'URL des images dans public/
const getImageUrl = (path) => {
  // Les fichiers dans public/ sont servis à la racine
  return path.startsWith('/') ? path : `/${path}`;
};
</script>

<style>
.vue-shell {
  min-height: 100vh;
  background: 
    radial-gradient(ellipse at 20% -10%, #ffd8e4 0%, transparent 50%),
    radial-gradient(ellipse at 100% 10%, #ffe7ee 0%, transparent 45%),
    #fbd1dc;
}

.snk-nav {
  position: sticky;
  top: 0;
  z-index: 50;
  backdrop-filter: saturate(140%) blur(8px);
  background: color-mix(in srgb, #ffe9ef 80%, white);
  border-bottom: 1px solid rgba(160, 22, 43, .08);
}

.snk-container {
  max-width: 1100px;
  margin: auto;
  padding: 14px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.snk-nav a {
  color: #a0162b;
  text-decoration: none;
  font-weight: 600;
  padding: 8px 12px;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.snk-nav a:hover {
  background: #fff7f1;
  box-shadow: 0 10px 30px rgba(160, 22, 43, 0.12);
}

.snk-spacer {
  flex: 1;
}

.snk-logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.snk-logo img {
  height: 36px;
  width: auto;
  display: block;
}

.snk-badge {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 999px;
  background: #fff7f1;
  border: 1px dashed #a0162b;
  color: #a0162b;
}

.search-bar-nav {
  margin: 0 10px;
}

.user-menu {
  position: relative;
  display: inline-block;
}

.user-name {
  color: #a0162b;
  font-weight: 600;
  padding: 8px 12px;
  border-radius: 10px;
  cursor: pointer;
  display: inline-block;
}

.user-name:hover {
  background: #fff7f1;
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(160, 22, 43, 0.12);
  border: 1px solid rgba(160, 22, 43, .08);
  min-width: 200px;
  display: flex;
  flex-direction: column;
  padding: 8px 0;
}

.user-dropdown a,
.user-dropdown button {
  padding: 10px 16px;
  color: #2b1d1d;
  text-decoration: none;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s ease;
}

.user-dropdown a:hover,
.user-dropdown button:hover {
  background: #ffe9ef;
}

.main-content {
  min-height: calc(100vh - 80px);
}
</style>
