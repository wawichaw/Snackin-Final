<template>
  <div>
    <h2>Tableau de bord admin</h2>
    <div class="grid">
      <div class="card"><div class="card-body"><RouterLink to="/admin/biscuits" class="btn">Gerer les biscuits</RouterLink></div></div>
      <div class="card"><div class="card-body"><RouterLink to="/admin/saveurs" class="btn">Gerer les saveurs</RouterLink></div></div>
      <div class="card"><div class="card-body"><RouterLink to="/admin/commandes" class="btn">Gerer les commandes</RouterLink></div></div>
      <div class="card"><div class="card-body"><RouterLink to="/admin/commentaires" class="btn">Gerer les commentaires</RouterLink></div></div>
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router';
</script>
