<template>
  <div>
    <h2>Commandes (admin)</h2>
    <div v-if="loading" class="card"><div class="card-body">Chargement des commandes...</div></div>
    <div v-else class="grid">
      <div v-if="!commandes.length" class="card"><div class="card-body">Aucune commande</div></div>
      <div v-else v-for="c in commandes" :key="c.id" class="card">
        <div class="card-body">
          <div><strong>Commande #{{ c.id }}</strong></div>
          <div>Utilisateur: {{ c.utilisateur_id ?? c.user_id ?? '-' }}</div>
          <div>Date: {{ c.date_commande ?? c.created_at }}</div>
          <div>Quantite: {{ c.quantite ?? c.total ?? '-' }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import axios from 'axios';

const commandes = ref([]);
const loading = ref(true);

const fetchCommandes = async () => {
  loading.value = true;
  try {
    const resp = await axios.get('/commandes', { withCredentials: true, headers: { 'X-Requested-With': 'XMLHttpRequest' } });
    commandes.value = resp.data?.data || resp.data || [];
  } catch (e) {
    console.error('fetch commandes', e);
    commandes.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(fetchCommandes);
</script>
