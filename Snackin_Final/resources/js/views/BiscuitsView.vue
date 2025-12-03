<template>
  <div class="biscuits-page">
    <div class="page-header">
      <h1>Nos Biscuits</h1>
      <RouterLink v-if="isAdmin" to="/admin/biscuits/create" class="btn-add">
        + Ajouter
      </RouterLink>
    </div>

    <div v-if="loading" class="loading-card">
      <div class="card-body">Chargement des biscuits...</div>
    </div>
    <div v-else-if="!biscuits.length" class="empty-card">
      <div class="card-body">
        <p>Aucun biscuit pour l'instant. Revenez bientôt — nouvelle fournée en préparation!</p>
        <p style="font-size: 12px; color: #999; margin-top: 10px;">Debug: {{ biscuits.length }} biscuits chargés</p>
        <p style="font-size: 12px; color: #999;">Vérifiez la console du navigateur (F12) pour plus de détails.</p>
      </div>
    </div>
    <div v-else class="biscuits-grid">
      <div v-for="b in displayedBiscuits" :key="b.id" class="biscuit-card">
        <!-- Bulle emoji qui dépasse -->
        <div class="flavor-emoji" :title="getSaveurName(b)">
          {{ getEmoji(b) }}
        </div>

        <!-- Image du biscuit -->
        <div class="biscuit-image">
          <img v-if="b.image" :src="getImageUrl(`/Contenu/img/${b.image}`)" :alt="b.nom_biscuit || b.nom || b.name">
          <span v-else class="no-image">Aucune image</span>
        </div>

        <!-- Infos du biscuit -->
        <div class="biscuit-info">
          <h5 class="card-title">{{ b.nom_biscuit ?? b.nom ?? b.name }}</h5>

          <div v-if="b.saveur" class="saveur-chip">
            <span class="emoji">{{ getEmoji(b) }}</span>
            <span class="saveur-name">{{ capitalize(getSaveurName(b)) }}</span>
          </div>

          <p v-if="b.description" class="desc">{{ b.description }}</p>

          <p class="card-text price">{{ formatPrice(b.prix) }} $</p>
        </div>

        <!-- Actions admin -->
        <div v-if="isAdmin" class="card-actions">
          <RouterLink :to="`/admin/biscuits/${b.id}/edit`" class="btn btn-sm btn-outline-secondary">
            Modifier
          </RouterLink>
          <button @click="deleteBiscuit(b.id)" class="btn btn-sm btn-outline-danger">
            Supprimer
          </button>
        </div>
      </div>
      
      <div v-if="hasMore && !showAll" class="show-more-container">
        <button @click="showAll = true" class="btn-show-more">
          Voir tous les biscuits ({{ biscuits.length }})
        </button>
      </div>
      
      <div v-if="showAll && hasMore" class="show-more-container">
        <button @click="showAll = false" class="btn-show-more">
          Afficher moins
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useAuth } from '../composables/auth';
import api from '../axios';

const router = useRouter();
const { user } = useAuth();
const isAdmin = computed(() => !!(user.value && (user.value.is_admin || user.value.role === 'admin')));

const biscuits = ref([]);
const loading = ref(true);
const showAll = ref(false);
const initialLimit = 4;

const displayedBiscuits = computed(() => {
  if (showAll.value) return biscuits.value;
  return biscuits.value.slice(0, initialLimit);
});

const hasMore = computed(() => biscuits.value.length > initialLimit);

// Map emoji par saveur
const emojiMap = {
  'original': '🍪',
  'chocolat': '🍫',
  'caramel': '🍮',
  'vanille': '🌼',
  'smores': '🔥🍫',
  'oreo': '🍪',
};

const getEmoji = (biscuit) => {
  const saveurName = biscuit.saveur ? 
    (typeof biscuit.saveur === 'string' ? biscuit.saveur.toLowerCase() : biscuit.saveur.nom_saveur?.toLowerCase()) : 
    null;
  return emojiMap[saveurName] || '🍪';
};

const getSaveurName = (biscuit) => {
  if (biscuit.saveur) {
    return typeof biscuit.saveur === 'string' ? biscuit.saveur : biscuit.saveur.nom_saveur;
  }
  return 'Saveur';
};

const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const formatPrice = (price) => {
  if (!price) return '0.00';
  return (typeof price === 'number' ? price.toFixed(2) : parseFloat(price).toFixed(2));
};

const getImageUrl = (path) => {
  return path.startsWith('/') ? path : `/${path}`;
};

const deleteBiscuit = async (id) => {
  if (!confirm('Supprimer ce biscuit ?')) return;
  
  try {
    await api.delete(`/biscuits/${id}`);
    biscuits.value = biscuits.value.filter(b => b.id !== id);
  } catch (e) {
    console.error('Failed to delete biscuit', e);
    alert('Erreur lors de la suppression');
  }
};

onMounted(async () => {
  try {
    const resp = await api.get('/biscuits?limit=20');
    
    // La réponse API devrait être { success: true, data: [...] }
    let data = [];
    
    // Extraire les données de la réponse
    if (resp.data?.data && Array.isArray(resp.data.data)) {
      // Format standard: { success: true, data: [...] }
      data = resp.data.data;
    } else if (Array.isArray(resp.data)) {
      // Format direct: [...]
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
    
    // S'assurer que les saveurs sont bien chargées et que chaque biscuit a un id
    biscuits.value = data
      .filter(b => b && b.id) // Filtrer les éléments sans id
      .map(b => ({
        ...b,
        saveur: b.saveur || (b.saveur_id ? { nom_saveur: 'Inconnue', emoji: '🍪' } : null)
      }));
  } catch (e) {
    console.error('Erreur lors du chargement des biscuits:', e);
    if (e.response) {
      console.error('Réponse erreur:', e.response.data);
      console.error('Status:', e.response.status);
    }
    biscuits.value = [];
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.biscuits-page {
  max-width: 1100px;
  margin: 34px auto;
  padding: 0 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: clamp(28px, 4vw, 42px);
  color: #a0162b;
  margin: 0;
}

.btn-add {
  background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
  color: white;
  padding: 12px 20px;
  border-radius: 999px;
  text-decoration: none;
  font-weight: 700;
  box-shadow: 0 4px 15px rgba(236, 72, 153, 0.3);
  transition: all 0.3s ease;
}

.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(236, 72, 153, 0.4);
}

.loading-card,
.empty-card {
  text-align: center;
  padding: 40px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 22px;
  border: 1px solid rgba(160, 22, 43, .08);
}

.biscuits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 18px;
  align-items: stretch;
}

.biscuit-card {
  position: relative;
  overflow: visible;
  display: flex;
  flex-direction: column;
  border-radius: 20px;
  border: 2px solid #f7c6de;
  background: linear-gradient(180deg, #fff 0%, #fff8f9 100%);
  box-shadow: 0 12px 28px rgba(236, 72, 153, .15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: fadeIn 0.6s ease-out;
  animation-fill-mode: both;
}

.biscuit-card:nth-child(1) { animation-delay: 0.1s; }
.biscuit-card:nth-child(2) { animation-delay: 0.2s; }
.biscuit-card:nth-child(3) { animation-delay: 0.3s; }
.biscuit-card:nth-child(4) { animation-delay: 0.4s; }

.biscuit-card::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 20px;
  padding: 2px;
  background: linear-gradient(135deg, #ffd6e5, #ffe7ee, #ffffff, #ffd6e5);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.biscuit-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 48px rgba(236, 72, 153, .25);
  border-color: #ec4899;
}

.biscuit-card:hover::before {
  opacity: 0.6;
}

.flavor-emoji {
  position: absolute;
  right: 12px;
  top: -18px;
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #fff 0%, #fff8f9 100%);
  border: 2px solid #f7c6de;
  border-radius: 999px;
  box-shadow: 0 10px 24px rgba(236, 72, 153, .25);
  font-size: 24px;
  transform: rotate(-8deg);
  z-index: 5;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.biscuit-card:hover .flavor-emoji {
  transform: rotate(8deg) scale(1.15);
  box-shadow: 0 12px 32px rgba(236, 72, 153, .35);
  border-color: #ec4899;
}

.biscuit-image {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  margin: 10px 10px 0;
  height: 180px;
  background: linear-gradient(135deg, #ffeaf2 0%, #fff1f7 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.biscuit-card:hover .biscuit-image {
  transform: scale(1.05);
}

.biscuit-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  color: #694256;
  font-weight: 600;
}

.biscuit-info {
  text-align: center;
  padding: 8px 12px 2px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 140px;
}

.biscuit-info .card-title {
  margin: 6px 0 2px;
  font-weight: 800;
  color: #2a1620;
  font-size: 18px;
}

.saveur-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  background: linear-gradient(135deg, #fff 0%, #fff8f9 100%);
  border: 1.5px solid #f7c6de;
  color: #694256;
  font-weight: 700;
  margin: 8px 0;
  font-size: 14px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(236, 72, 153, .1);
}

.biscuit-card:hover .saveur-chip {
  transform: scale(1.05);
  border-color: #ec4899;
  box-shadow: 0 4px 12px rgba(236, 72, 153, .2);
}

.saveur-chip .emoji {
  font-size: 1rem;
}

.saveur-chip .saveur-name {
  font-weight: 600;
}

.desc {
  color: #694256;
  font-size: .92rem;
  margin: 2px auto 10px;
  max-width: 92%;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.6em;
}

.price {
  font-weight: 900;
  color: #db2777;
  margin-top: 2px;
  font-size: 18px;
}

.card-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  padding: 10px 0 16px;
}

.btn.btn-sm {
  border-radius: 999px;
  padding: 8px 14px;
  font-weight: 700;
  font-size: 14px;
  border: none;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
}

.btn.btn-sm.btn-outline-secondary {
  background: #fff;
  color: #2a1620;
  border: 1px solid #f7c6de;
}

.btn.btn-sm.btn-outline-secondary:hover {
  background: rgba(236, 72, 153, .08);
  border-color: #ec4899;
}

.btn.btn-sm.btn-outline-danger {
  background: #fff;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

.btn.btn-sm.btn-outline-danger:hover {
  background: #fff5f5;
  border-color: #fda4a4;
}

.show-more-container {
  grid-column: 1 / -1;
  text-align: center;
  margin-top: 20px;
}

.btn-show-more {
  background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
  color: white;
  padding: 14px 28px;
  border: none;
  border-radius: 999px;
  font-size: 16px;
  font-weight: 700;
  box-shadow: 0 6px 20px rgba(236, 72, 153, .35);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.btn-show-more::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.btn-show-more:hover::before {
  width: 300px;
  height: 300px;
}

.btn-show-more:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 28px rgba(236, 72, 153, .45);
}

.btn-show-more:active {
  transform: translateY(-1px);
}

@media (max-width: 900px) {
  .biscuits-grid {
    grid-template-columns: 1fr;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}
</style>
