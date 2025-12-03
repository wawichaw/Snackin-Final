<template>
  <section class="vue-hero">
    <div class="vue-hero-card">
      <div class="vue-tag">Interface rendue avec Vue</div>
      <h1>Bienvenue sur la SPA Vue</h1>
      <p>Ce front est monté avec Vue 3 + Vite. Utilise le menu pour naviguer ou modifie les vues dans <code>resources/js/views</code>.</p>
      <div class="vue-cta">
        <RouterLink to="/about" class="btn primary">Voir l’exemple</RouterLink>
        <RouterLink to="/" class="btn">Revenir à l’accueil</RouterLink>
      </div>
    </div>
  </section>
</template>

<script setup>
import { RouterLink } from 'vue-router';
</script>
