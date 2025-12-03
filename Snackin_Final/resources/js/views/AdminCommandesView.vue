<template>
  <div class="admin-commandes-page">
    <div class="page-header">
      <div>
        <h1>📦 Gestion des Commandes</h1>
        <p class="subtitle">Consultez, modifiez et suivez toutes les commandes de vos clients</p>
      </div>
      <button class="btn primary" type="button" @click="fetchCommandes">🔄 Rafraîchir</button>
    </div>

    <div v-if="successMessage" class="alert alert-success">
      ✨ {{ successMessage }}
    </div>

    <div v-if="error" class="alert alert-error">
      ❌ {{ error }}
    </div>

    <div class="admin-table-container">
      <div v-if="loading" class="loading-card">
        <div class="card-body">Chargement des commandes...</div>
      </div>
      <div v-else-if="!commandes.length" class="empty-card">
        <div class="card-body">
          <div style="font-size: 48px; margin-bottom: 20px;">📦</div>
          <h3>Aucune commande trouvée</h3>
          <p>Les commandes de vos clients apparaîtront ici.</p>
        </div>
      </div>
      <table v-else class="admin-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Client</th>
            <th>Email</th>
            <th>Détails</th>
            <th>Total</th>
            <th>Statut</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in commandes" :key="c.id">
            <td>{{ c.id }}</td>
            <td>
              <strong>{{ c.client_nom || c.nom || '-' }}</strong>
            </td>
            <td>{{ c.client_email || c.email || '-' }}</td>
            <td>
              <div v-if="c.details_json">
                <span v-if="getDetails(c.details_json).taille">
                  Boîte {{ getDetails(c.details_json).taille }}
                </span>
                <span v-else>-</span>
              </div>
              <span v-else>-</span>
            </td>
            <td>
              <strong v-if="c.total_prix">{{ formatPrice(c.total_prix) }} $</strong>
              <span v-else>-</span>
            </td>
            <td>
              <span :class="['status-badge', getStatusClass(c.status)]">
                {{ getStatusLabel(c.status) }}
              </span>
            </td>
            <td>{{ formatDate(c.created_at) }}</td>
            <td>
              <div class="action-buttons">
                <RouterLink 
                  :to="`/admin/commandes/${c.id}`" 
                  class="btn btn-sm btn-view"
                  title="Voir"
                >
                  👁️ Voir
                </RouterLink>
                <RouterLink 
                  :to="`/admin/commandes/${c.id}/edit`" 
                  class="btn btn-sm btn-edit"
                  title="Éditer"
                >
                  ✏️ Éditer
                </RouterLink>
                <button 
                  @click="deleteCommande(c.id)" 
                  class="btn btn-sm btn-delete"
                  title="Supprimer"
                >
                  🗑️ Supprimer
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import api from '../axios';

const commandes = ref([]);
const loading = ref(true);
const error = ref('');
const successMessage = ref('');

const fetchCommandes = async () => {
  loading.value = true;
  error.value = '';
  try {
    const resp = await api.get('/commandes');
    const data = resp.data?.data || resp.data || [];
    commandes.value = Array.isArray(data) ? data : [];
  } catch (e) {
    error.value = 'Impossible de charger les commandes.';
    commandes.value = [];
  } finally {
    loading.value = false;
  }
};

const deleteCommande = async (id) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) return;
  try {
    await api.delete(`/commandes/${id}`);
    successMessage.value = 'Commande supprimée';
    setTimeout(() => { successMessage.value = ''; }, 3000);
    await fetchCommandes();
  } catch (e) {
    error.value = 'Erreur lors de la suppression';
    setTimeout(() => { error.value = ''; }, 3000);
  }
};

const getDetails = (detailsJson) => {
  try {
    return typeof detailsJson === 'string' ? JSON.parse(detailsJson) : detailsJson;
  } catch {
    return {};
  }
};

const getStatusClass = (status) => {
  const classes = {
    'en_attente': 'status-warning',
    'en_preparation': 'status-info',
    'prete': 'status-success',
    'livree': 'status-secondary',
    'annulee': 'status-danger'
  };
  return classes[status] || 'status-secondary';
};

const getStatusLabel = (status) => {
  const labels = {
    'en_attente': '⏳ En attente',
    'en_preparation': '👨‍🍳 En préparation',
    'prete': '✅ Prête',
    'livree': '📦 Livrée',
    'annulee': '❌ Annulée'
  };
  return labels[status] || status;
};

const formatPrice = (price) => {
  return parseFloat(price).toFixed(2);
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

onMounted(fetchCommandes);
</script>

<style scoped>
.admin-commandes-page {
  max-width: 1400px;
  margin: 40px auto;
  padding: 0 20px;
  animation: fadeIn 0.6s ease-out;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  gap: 20px;
}

.page-header h1 {
  font-size: clamp(28px, 4vw, 42px);
  color: #a0162b;
  margin: 0 0 8px;
  font-weight: 900;
}

.subtitle {
  color: rgba(43, 29, 29, 0.7);
  margin: 0;
  font-size: 16px;
}

.alert {
  padding: 16px 20px;
  border-radius: 12px;
  margin-bottom: 24px;
  animation: slideIn 0.4s ease-out;
}

.alert-success {
  background: #d4edda;
  color: #155724;
  border: 2px solid #c3e6cb;
}

.alert-error {
  background: #f8d7da;
  color: #721c24;
  border: 2px solid #f5c6cb;
}

.admin-table-container {
  background: linear-gradient(180deg, #fff 0%, #fff8f9 100%);
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 12px 32px rgba(160, 22, 43, 0.1);
  border: 2px solid rgba(160, 22, 43, 0.1);
  overflow-x: auto;
}

.loading-card,
.empty-card {
  text-align: center;
  padding: 60px;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.admin-table thead {
  background: linear-gradient(135deg, #fff8f9 0%, #ffe9ef 100%);
}

.admin-table th {
  padding: 16px 12px;
  text-align: left;
  font-weight: 700;
  color: #a0162b;
  border-bottom: 2px solid rgba(160, 22, 43, 0.2);
}

.admin-table td {
  padding: 16px 12px;
  border-bottom: 1px solid rgba(160, 22, 43, 0.1);
  vertical-align: middle;
}

.admin-table tbody tr:hover {
  background: rgba(255, 243, 247, 0.5);
}

.status-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 12px;
}

.status-warning {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.status-info {
  background: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

.status-success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-secondary {
  background: #e2e3e5;
  color: #383d41;
  border: 1px solid #d6d8db;
}

.status-danger {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.action-buttons {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.btn.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 700;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
}

.btn-view {
  background: #17a2b8;
  color: white;
}

.btn-view:hover {
  background: #138496;
  transform: translateY(-1px);
}

.btn-edit {
  background: #ffc107;
  color: #212529;
}

.btn-edit:hover {
  background: #e0a800;
  transform: translateY(-1px);
}

.btn-delete {
  background: #dc3545;
  color: white;
}

.btn-delete:hover {
  background: #c82333;
  transform: translateY(-1px);
}

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

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@media (max-width: 768px) {
  .admin-table {
    font-size: 12px;
  }
  
  .admin-table th,
  .admin-table td {
    padding: 10px 6px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>
