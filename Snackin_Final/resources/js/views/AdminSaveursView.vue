<template>
  <div>
    <h2>Gestion des saveurs</h2>
    <div class="mb-3 d-flex gap-2 align-items-center">
      <input v-model="name" placeholder="Nom nouvelle saveur" class="form-control" />
      <button class="btn primary" @click="create">Creer</button>
    </div>
    <div v-if="loading" class="card"><div class="card-body">Chargement...</div></div>
    <div v-else class="grid">
      <div v-if="!saveurs.length" class="card"><div class="card-body">Aucune saveur</div></div>
      <div v-else v-for="s in saveurs" :key="s.id" class="card">
        <div class="card-body">
          <h4>{{ s.nom ?? s.name }}</h4>
          <p>{{ s.description }}</p>
          <button class="btn btn-sm btn-danger" @click="remove(s.id)">Supprimer</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import axios from 'axios';

const saveurs = ref([]);
const loading = ref(true);
const name = ref('');

const fetchList = async () => {
  loading.value = true;
  try {
    const resp = await axios.get('/saveurs');
    saveurs.value = resp.data || [];
  } catch (e) {
    saveurs.value = [];
  } finally {
    loading.value = false;
  }
};

const create = async () => {
  if (!name.value) return;
  try {
    await axios.post('/saveurs', { nom: name.value, description: '' });
    name.value = '';
    fetchList();
  } catch (e) {
    alert('Erreur: ' + (e.response?.data?.message || e.message));
  }
};

const remove = async (id) => {
  if (!confirm('Supprimer cette saveur ?')) return;
  try {
    await axios.delete(`/saveurs/${id}`);
    fetchList();
  } catch (e) {
    alert('Erreur: ' + (e.response?.data?.message || e.message));
  }
};

onMounted(fetchList);
</script>
