<template>
  <div class="biscuit-detail-page">
    <div v-if="loading" class="loading-card">
      <div class="card-body">Chargement...</div>
    </div>
    <div v-else-if="!biscuit" class="error-card">
      <div class="card-body">Biscuit introuvable.</div>
    </div>
    <div v-else class="biscuit-detail">
      <div class="biscuit-header">
        <h1>{{ biscuit.nom_biscuit ?? biscuit.nom ?? biscuit.name }}</h1>
        <span v-if="biscuit.prix" class="price-badge">{{ (biscuit.prix || 0).toFixed ? biscuit.prix.toFixed(2) : biscuit.prix || '0.00' }} $</span>
      </div>
      
      <div class="biscuit-content">
        <div class="biscuit-description">
          <p>{{ biscuit.description || 'Délicieux biscuit fait maison avec amour.' }}</p>
        </div>
        
        <div class="biscuit-actions">
          <RouterLink to="/commander" class="btn primary">Commander ce biscuit</RouterLink>
          <RouterLink to="/biscuits" class="btn outline">Voir tous les biscuits</RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import axios from 'axios';
import { useRoute, RouterLink } from 'vue-router';

const route = useRoute();
const biscuit = ref(null);
const loading = ref(true);

const load = async (id) => {
  loading.value = true;
  try {
    const resp = await axios.get(`/api/biscuits/${id}`);
    biscuit.value = resp.data;
  } catch (e) {
    console.error(e);
    biscuit.value = null;
  } finally {
    loading.value = false;
  }
};

onMounted(() => load(route.params.id));
watch(() => route.params.id, (id) => load(id));
</script>

<style scoped>
.biscuit-detail-page {
  max-width: 1100px;
  margin: 34px auto;
  padding: 0 20px;
}

.loading-card,
.error-card {
  text-align: center;
  padding: 40px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 22px;
  border: 1px solid rgba(160, 22, 43, .08);
}

.biscuit-detail {
  background: linear-gradient(180deg, #fff8f9 0%, #fff 100%);
  border: 1px solid rgba(160, 22, 43, .08);
  border-radius: 22px;
  padding: 40px;
  box-shadow: 0 12px 30px rgba(160, 22, 43, 0.08);
}

.biscuit-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.biscuit-header h1 {
  font-size: clamp(28px, 4vw, 42px);
  color: #a0162b;
  margin: 0;
}

.price-badge {
  background: #a0162b;
  color: #fff;
  padding: 12px 20px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 18px;
  box-shadow: 0 8px 16px rgba(160, 22, 43, .18);
}

.biscuit-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.biscuit-description {
  font-size: 18px;
  line-height: 1.6;
  color: rgba(43, 29, 29, 0.8);
}

.biscuit-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
</style>
