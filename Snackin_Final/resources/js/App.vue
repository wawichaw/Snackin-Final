<template>
  <div class="vue-shell">
    <header class="navbar navbar-expand-md navbar-light bg-white shadow-sm">
      <div class="container">
        <RouterLink class="navbar-brand fw-bold text-danger d-inline-flex align-items-center" to="/">
          Snackin
          <span class="vue-pill">Vue UI</span>
        </RouterLink>
        <div class="collapse navbar-collapse show">
          <ul class="navbar-nav me-auto mb-2 mb-md-0">
            <li class="nav-item"><RouterLink to="/biscuits" class="nav-link">Biscuits</RouterLink></li>
            <li class="nav-item"><RouterLink to="/saveurs" class="nav-link">Saveurs</RouterLink></li>
            <li class="nav-item"><RouterLink to="/commentaires" class="nav-link">Commentaires</RouterLink></li>
            <li class="nav-item"><RouterLink to="/about" class="nav-link">À propos</RouterLink></li>
          </ul>
        </div>
      </div>
    </header>

    <main class="py-4">
      <div class="container" style="max-width: 1200px; padding: 20px;">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router';
</script>
