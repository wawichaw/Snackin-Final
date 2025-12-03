<template>
  <div class="saveurs-page">
    <div class="page-header">
      <h1>Nos Saveurs</h1>
      <p class="subtitle">Découvrez toutes nos saveurs de biscuits</p>
    </div>
    
    <div v-if="loading" class="loading-card">
      <div class="card-body">Chargement des saveurs...</div>
    </div>
    <div v-else-if="!saveurs.length" class="empty-card">
      <div class="card-body">Aucune saveur disponible pour le moment.</div>
    </div>
    <div v-else class="saveurs-grid">
      <div v-for="s in saveurs" :key="s.id" class="saveur-card">
        <div class="saveur-emoji">{{ s.emoji || '🍪' }}</div>
        <div class="saveur-content">
          <h3>{{ s.nom_saveur || s.nom || s.name }}</h3>
          <p v-if="s.description">{{ s.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import api from '../axios';

const saveurs = ref([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const resp = await api.get('/saveurs');
    const data = resp.data?.data || resp.data || [];
    saveurs.value = Array.isArray(data) ? data : [];
  } catch (e) {
    console.error('Erreur chargement saveurs:', e);
    saveurs.value = [];
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.saveurs-page {
  max-width: 1100px;
  margin: 40px auto;
  padding: 0 20px;
  animation: fadeIn 0.6s ease-out;
}

.page-header {
  text-align: center;
  margin-bottom: 48px;
  animation: fadeIn 0.6s ease-out;
}

.page-header h1 {
  font-size: clamp(32px, 5vw, 52px);
  color: #a0162b;
  margin: 6px 0 16px;
  font-weight: 900;
  background: linear-gradient(135deg, #a0162b 0%, #ec4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  color: rgba(43, 29, 29, 0.7);
  font-size: 18px;
  margin: 0;
}

.loading-card,
.empty-card {
  text-align: center;
  padding: 60px;
  background: linear-gradient(180deg, #fff8f9 0%, #fff 100%);
  border-radius: 24px;
  border: 2px solid rgba(160, 22, 43, .1);
  box-shadow: 0 12px 32px rgba(160, 22, 43, 0.1);
}

.saveurs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.saveur-card {
  position: relative;
  background: linear-gradient(180deg, #fff8f9 0%, #fff 100%);
  border: 2px solid rgba(160, 22, 43, .1);
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 12px 32px rgba(160, 22, 43, 0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation: fadeIn 0.6s ease-out;
  animation-fill-mode: both;
  overflow: hidden;
}

.saveur-card:nth-child(1) { animation-delay: 0.1s; }
.saveur-card:nth-child(2) { animation-delay: 0.2s; }
.saveur-card:nth-child(3) { animation-delay: 0.3s; }
.saveur-card:nth-child(4) { animation-delay: 0.4s; }
.saveur-card:nth-child(5) { animation-delay: 0.5s; }
.saveur-card:nth-child(6) { animation-delay: 0.6s; }

.saveur-card::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 24px;
  padding: 2px;
  background: linear-gradient(135deg, #ffd6e5, #ffe7ee, #ffffff, #ffd6e5);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.saveur-card:hover {
  transform: translateY(-10px) scale(1.03);
  box-shadow: 0 24px 56px rgba(160, 22, 43, 0.2);
  border-color: rgba(236, 72, 153, 0.3);
}

.saveur-card:hover::before {
  opacity: 0.6;
}

.saveur-emoji {
  font-size: 64px;
  text-align: center;
  margin-bottom: 20px;
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

.saveur-card:hover .saveur-emoji {
  transform: scale(1.2) rotate(10deg);
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.2));
}

.saveur-content {
  text-align: center;
}

.saveur-content h3 {
  font-size: 24px;
  color: #a0162b;
  margin: 0 0 12px;
  font-weight: 800;
}

.saveur-content p {
  color: rgba(43, 29, 29, 0.75);
  margin: 0;
  line-height: 1.6;
  font-size: 15px;
}

@media (max-width: 768px) {
  .saveurs-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .saveur-card {
    padding: 24px;
  }
}
</style>
