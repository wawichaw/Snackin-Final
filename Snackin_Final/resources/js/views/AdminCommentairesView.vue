<template>
  <div class="page-shell">
    <div class="section-header">
      <div>
        <p class="eyebrow">Admin</p>
        <h1>Commentaires</h1>
        <p class="muted">Liste et suppression rapide des commentaires publics.</p>
      </div>
      <button class="btn ghost" type="button" @click="fetchComments">Rafraichir</button>
    </div>

    <div class="panel">
      <div v-if="loading" class="card">Chargement...</div>
      <div v-else-if="!comments.length" class="card">Aucun commentaire.</div>
      <table v-else class="table-list">
        <thead>
          <tr>
            <th>ID</th>
            <th>Biscuit</th>
            <th>Texte</th>
            <th>Note</th>
            <th>Auteur</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in comments" :key="c.id">
            <td>{{ c.id }}</td>
            <td>{{ c.biscuit?.nom_biscuit || c.biscuit?.nom || '-' }}</td>
            <td class="truncate">{{ c.texte || c.message || '' }}</td>
            <td>{{ c.note || '-' }}</td>
            <td>{{ c.nom_affiche || c.nom_visiteur || c.nom || 'Anonyme' }}</td>
            <td class="text-end">
              <button class="btn danger" type="button" @click="remove(c.id)">Supprimer</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="error" class="text-error mt-2">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import axios from 'axios';

const comments = ref([]);
const loading = ref(true);
const error = ref('');

const fetchComments = async () => {
  loading.value = true;
  error.value = '';
  try {
    const resp = await axios.get('/api/commentaires');
    comments.value = resp.data || [];
  } catch (e) {
    error.value = 'Impossible de charger les commentaires.';
    comments.value = [];
  } finally {
    loading.value = false;
  }
};

const remove = async (id) => {
  if (!confirm('Supprimer ce commentaire ?')) return;
  try {
    await axios.delete(`/api/commentaires/${id}`);
    comments.value = comments.value.filter((c) => c.id !== id);
  } catch (e) {
    error.value = 'Suppression impossible.';
  }
};

onMounted(fetchComments);
</script>
