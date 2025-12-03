<template>
  <div>
    <h2>Saveurs</h2>
    <div class="grid">
      <div v-if="!saveurs.length" class="card"><div class="card-body">Aucune saveur.</div></div>
      <div v-else v-for="s in saveurs" :key="s.id" class="card">
        <div class="card-body">
          <h4>{{ s.nom ?? s.name }}</h4>
          <p>{{ s.description ?? '' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import axios from 'axios';

const saveurs = ref([]);

onMounted(async () => {
  try {
    const resp = await axios.get('/api/saveurs');
    saveurs.value = resp.data || [];
  } catch (e) {
    console.error(e);
    saveurs.value = [];
  }
});
</script>
