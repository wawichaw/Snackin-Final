<template>
  <div>
    <h2>Gestion des biscuits</h2>
    <div class="mb-3 d-flex gap-2 align-items-center">
      <input v-model="title" placeholder="Nom nouveau biscuit" class="form-control" />
      <button class="btn primary" @click="create">Creer</button>
    </div>
    <div v-if="loading" class="card"><div class="card-body">Chargement...</div></div>
    <div v-else class="grid">
      <div v-if="!biscuits.length" class="card"><div class="card-body">Aucun biscuit</div></div>
      <div v-else v-for="b in biscuits" :key="b.id" class="card">
        <div class="card-body">
          <h4>{{ b.nom ?? b.name }}</h4>
          <p>{{ b.description }}</p>
          <button class="btn btn-sm btn-danger" @click="remove(b.id)">Supprimer</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import axios from 'axios';

const biscuits = ref([]);
const loading = ref(true);
const title = ref('');

const fetchList = async () => {
  loading.value = true;
  try {
    const resp = await axios.get('/biscuits');
    biscuits.value = resp.data || [];
  } catch (e) {
    biscuits.value = [];
  } finally {
    loading.value = false;
  }
};

const create = async () => {
  if (!title.value) return;
  try {
    await axios.post('/biscuits', { nom: title.value, description: '' });
    title.value = '';
    fetchList();
  } catch (e) {
    alert('Erreur: ' + (e.response?.data?.message || e.message));
  }
};

const remove = async (id) => {
  if (!confirm('Supprimer ce biscuit ?')) return;
  try {
    await axios.delete(`/biscuits/${id}`);
    fetchList();
  } catch (e) {
    alert('Erreur: ' + (e.response?.data?.message || e.message));
  }
};

onMounted(fetchList);
</script>
