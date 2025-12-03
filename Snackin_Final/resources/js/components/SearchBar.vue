<template>
  <div class="search-bar">
    <input
      type="text"
      class="search-input"
      placeholder="Rechercher un biscuit..."
      v-model="term"
    />
    <ul
      v-if="results.length"
      class="search-results"
    >
      <li
        v-for="item in results"
        :key="item.id"
        class="search-result-item"
        @click="handleSelect(item)"
      >
        {{ item.nom || item.nom_biscuit || item.name || item.titre }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import api from '../axios';

const router = useRouter();
const term = ref('');
const results = ref([]);
let timeoutId = null;

watch(term, (value) => {
  clearTimeout(timeoutId);
  if (!value || value.length < 2) {
    results.value = [];
    return;
  }
  timeoutId = setTimeout(async () => {
    try {
      const resp = await api.get('/biscuits/autocomplete', { params: { term: value } });
      console.log('Réponse autocomplete:', resp.data);
      // Gérer différentes structures de réponse
      let data = [];
      if (resp.data?.data && Array.isArray(resp.data.data)) {
        data = resp.data.data;
      } else if (Array.isArray(resp.data)) {
        data = resp.data;
      } else if (resp.data && typeof resp.data === 'object') {
        // Chercher un tableau dans l'objet
        for (const key in resp.data) {
          if (Array.isArray(resp.data[key])) {
            data = resp.data[key];
            break;
          }
        }
      }
      results.value = data.filter(item => item && item.id);
      console.log('Résultats autocomplete:', results.value.length);
    } catch (e) {
      console.error('Erreur autocomplete', e);
      console.error('Erreur response:', e.response?.data);
      results.value = [];
    }
  }, 300);
});

const handleSelect = (item) => {
  console.log('Selection autocompletion', item);
  results.value = [];
  term.value = '';
  // Rediriger vers la page du biscuit
  const biscuitId = item.id;
  if (biscuitId) {
    router.push(`/biscuits/${biscuitId}`);
  }
};
</script>

<style scoped>
.search-bar {
  position: relative;
  min-width: 250px;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid rgba(160, 22, 43, 0.2);
  border-radius: 999px;
  background: white;
  font-size: 14px;
  color: #2b1d1d;
}

.search-input:focus {
  outline: none;
  border-color: #a0162b;
  box-shadow: 0 0 0 3px rgba(160, 22, 43, 0.1);
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 8px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(160, 22, 43, 0.12);
  border: 1px solid rgba(160, 22, 43, .08);
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  list-style: none;
  padding: 8px 0;
  margin: 8px 0 0 0;
}

.search-result-item {
  padding: 10px 16px;
  cursor: pointer;
  color: #2b1d1d;
  transition: background 0.2s ease;
}

.search-result-item:hover {
  background: #ffe9ef;
}
</style>
