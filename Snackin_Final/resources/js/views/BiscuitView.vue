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
  border: 2px solid rgba(160, 22, 43, .1);
  border-radius: 28px;
  padding: 48px;
  box-shadow: 0 20px 60px rgba(160, 22, 43, 0.12);
  animation: fadeIn 0.6s ease-out;
  position: relative;
  overflow: hidden;
}

.biscuit-detail::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(236, 72, 153, 0.08) 0%, transparent 70%);
  border-radius: 50%;
  animation: pulse 6s ease-in-out infinite;
}

.biscuit-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 20px;
  position: relative;
  z-index: 1;
}

.biscuit-header h1 {
  font-size: clamp(32px, 5vw, 48px);
  color: #a0162b;
  margin: 0;
  font-weight: 900;
  background: linear-gradient(135deg, #a0162b 0%, #ec4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.price-badge {
  background: linear-gradient(135deg, #a0162b 0%, #c91e3a 100%);
  color: #fff;
  padding: 14px 24px;
  border-radius: 999px;
  font-weight: 800;
  font-size: 20px;
  box-shadow: 0 10px 28px rgba(160, 22, 43, .3);
  transition: all 0.3s ease;
  animation: pulse 2s ease-in-out infinite;
}

.price-badge:hover {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 12px 36px rgba(160, 22, 43, .4);
  animation: none;
}

.biscuit-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
  position: relative;
  z-index: 1;
}

.biscuit-description {
  font-size: 19px;
  line-height: 1.8;
  color: rgba(43, 29, 29, 0.85);
  padding: 24px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 16px;
  border: 1px solid rgba(160, 22, 43, 0.1);
  box-shadow: 0 4px 12px rgba(160, 22, 43, 0.08);
}

.biscuit-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 8px;
}
</style>
