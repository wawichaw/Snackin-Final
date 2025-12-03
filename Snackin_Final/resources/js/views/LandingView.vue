<template>
  <div class="landing-page">
    <section class="hero">
      <div class="hero-inner">
        <div>
          <div class="kickers">
            <span>🍪 Frais du jour</span>
            <span>🧁 Fait maison</span>
            <span>🌸 Très cute</span>
          </div>
          <h1>Croquants dehors, fondants dedans.<br>Les biscuits qui rendent tout le monde heureux.</h1>
          <p>Gérez vos biscuits, découvrez les saveurs et passez vos commandes en 2 clics.</p>

          <div class="cta-row">
            <RouterLink to="/commander" class="btn primary">Commander</RouterLink>
            <RouterLink to="/biscuits" class="btn">Découvrez notre sélection</RouterLink>
            <RouterLink v-if="isAdmin" to="/admin/saveurs" class="btn outline">Saveurs</RouterLink>
          </div>
        </div>

        <div class="hero-card">
          <div class="hero-visual">
            <img :src="getImageUrl('/Contenu/img/cookie-oreo.jpg')" alt="Cookie Oreo">
          </div>
          <span class="sticker">Best-seller ✨</span>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="grid">
        <div class="card">
          <h3>Commander en douceur</h3>
          <p>Choisis la taille (4, 6, 12) et compose ta boîte.<br>Tu récupères au point de ramassage.</p>
          <p><RouterLink to="/commander" class="btn primary">Je commande</RouterLink></p>
        </div>
        <div class="card">
          <h3>Découvrir le menu</h3>
          <p>Toutes les recettes dispo + notes et commentaires des gens.</p>
          <p><RouterLink to="/biscuits" class="btn">Voir les biscuits</RouterLink></p>
        </div>
        <div class="card">
          <h3>Partager son avis</h3>
          <p>Découvrez ce que pensent nos clients et partagez votre expérience.</p>
          <p><RouterLink to="/commentaires" class="btn outline">Voir les commentaires</RouterLink></p>
        </div>
        <div v-if="isAdmin" class="card">
          <h3>Saveurs du moment</h3>
          <p>Ajoute/édite les saveurs (admin) ou inspire-toi pour ta commande.</p>
          <p><RouterLink to="/admin/saveurs" class="btn outline">Saveurs</RouterLink></p>
        </div>
      </div>
    </section>

    <footer>
      <small>© {{ new Date().getFullYear() }} Snackin — Fait avec Laravel & beaucoup d'amour.</small>
    </footer>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { useAuth } from '../composables/auth';

const { user } = useAuth();
const isAdmin = computed(() => !!(user.value && (user.value.is_admin || user.value.role === 'admin')));

// Fonction pour obtenir l'URL des images dans public/
const getImageUrl = (path) => {
  // Les fichiers dans public/ sont servis à la racine
  return path.startsWith('/') ? path : `/${path}`;
};

onMounted(() => {
  // Pas de marquee nécessaire
});
</script>

<style scoped>
.landing-page {
  min-height: 100vh;
}

.hero {
  position: relative;
  overflow: hidden;
}

.hero-inner {
  max-width: 1100px;
  margin: auto;
  padding: 42px 20px;
  display: grid;
  grid-template-columns: 1.1fr .9fr;
  gap: 24px;
}

.hero h1 {
  font-size: clamp(28px, 4vw, 46px);
  line-height: 1.05;
  margin: 6px 0 10px;
  color: #a0162b;
}

.hero p {
  margin: 0 0 18px;
}

.kickers {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.kickers span {
  background: #fff7f1;
  border: 1px solid rgba(160, 22, 43, .15);
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
}

.cta-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.hero-card {
  position: relative;
  background: #fff7f1;
  border-radius: 28px;
  padding: 18px;
  border: 2px solid #f6d9d9;
  box-shadow: 0 10px 30px rgba(160, 22, 43, 0.12);
}

.hero-card .sticker {
  position: absolute;
  right: -10px;
  top: -10px;
  background: #a0162b;
  color: #fff;
  padding: 10px 14px;
  border-radius: 999px;
  font-weight: 700;
  transform: rotate(8deg);
  z-index: 40;
  box-shadow: 0 6px 16px rgba(160, 22, 43, .25);
}

.hero-visual {
  aspect-ratio: 1/1;
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  background: radial-gradient(80% 80% at 50% 50%, #b01e36 0%, #7d0f21 100%);
}

.hero-visual img {
  position: absolute;
  inset: 0;
  margin: auto;
  max-width: 88%;
  max-height: 88%;
  filter: drop-shadow(0 20px 40px rgba(0, 0, 0, .25));
}


.section {
  max-width: 1100px;
  margin: 34px auto;
  padding: 0 20px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.card {
  position: relative;
  background: linear-gradient(180deg, #fff8f9 0%, #fff 100%);
  border: 1px solid rgba(160, 22, 43, .08);
  border-radius: 22px;
  padding: 18px;
  box-shadow: 0 12px 30px rgba(160, 22, 43, 0.08);
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: transform .18s ease, box-shadow .18s ease;
}

.card:hover {
  transform: translateY(-6px) scale(1.01);
  box-shadow: 0 18px 40px rgba(160, 22, 43, 0.12);
}

.card::before {
  content: "🌸";
  position: absolute;
  top: 8px;
  right: 10px;
  font-size: 18px;
}

.card h3 {
  margin: 0;
  color: #a0162b;
}

.card p {
  margin: 0;
}

footer {
  margin: 40px 0 24px;
  text-align: center;
  color: #6b5d5d;
}

@media (max-width: 900px) {
  .hero-inner {
    grid-template-columns: 1fr;
  }

  .grid {
    grid-template-columns: 1fr;
  }
}

</style>
