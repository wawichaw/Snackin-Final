<template>
  <div class="admin-commentaires-page">
    <div class="page-header">
      <div>
        <h1>💬 Gestion des Commentaires</h1>
        <p class="subtitle">Modérez et gérez tous les commentaires de vos clients</p>
      </div>
      <button class="btn primary" type="button" @click="fetchComments">🔄 Rafraîchir</button>
    </div>

    <div v-if="successMessage" class="alert alert-success">
      ✨ {{ successMessage }}
    </div>

    <div v-if="error" class="alert alert-error">
      ❌ {{ error }}
    </div>

    <div class="admin-table-container">
      <div v-if="loading" class="loading-card">
        <div class="card-body">Chargement des commentaires...</div>
      </div>
      <div v-else-if="!comments.length" class="empty-card">
        <div class="card-body">
          <div style="font-size: 48px; margin-bottom: 20px;">💬</div>
          <h3>Aucun commentaire trouvé</h3>
          <p>Les commentaires de vos clients apparaîtront ici.</p>
        </div>
      </div>
      <table v-else class="admin-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Auteur</th>
            <th>Biscuit</th>
            <th>Commentaire</th>
            <th>Note</th>
            <th>Statut</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in comments" :key="c.id">
            <td>{{ c.id }}</td>
            <td>
              <strong>{{ c.nom_affiche || c.nom_visiteur || c.nom || 'Anonyme' }}</strong>
              <br v-if="c.email_visiteur || c.email">
                <small style="color: #666;">{{ c.email_visiteur || c.email }}</small>
              </br>
            </td>
            <td>{{ c.biscuit?.nom_biscuit || c.biscuit?.nom || '-' }}</td>
            <td class="comment-text">
              <div>{{ truncate(c.texte || c.message || '', 100) }}</div>
            </td>
            <td>
              <div v-if="c.note" class="rating-stars">
                <span v-for="i in 5" :key="i" :class="{ filled: i <= c.note }">
                  {{ i <= c.note ? '⭐' : '☆' }}
                </span>
              </div>
              <span v-else style="color: #999;">-</span>
            </td>
            <td>
              <span :class="['status-badge', c.modere ? 'status-approved' : 'status-pending']">
                {{ c.modere ? '✅ Approuvé' : '⏳ En attente' }}
              </span>
            </td>
            <td>{{ formatDate(c.created_at) }}</td>
            <td>
              <div class="action-buttons">
                <button 
                  v-if="!c.modere" 
                  @click="moderateComment(c.id, 'approve')" 
                  class="btn btn-sm btn-approve"
                  title="Approuver"
                >
                  ✅ Approuver
                </button>
                <button 
                  v-if="c.modere" 
                  @click="moderateComment(c.id, 'reject')" 
                  class="btn btn-sm btn-reject"
                  title="Rejeter"
                >
                  ❌ Rejeter
                </button>
                <button 
                  @click="deleteComment(c.id)" 
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
import api from '../axios';

const comments = ref([]);
const loading = ref(true);
const error = ref('');
const successMessage = ref('');

const fetchComments = async () => {
  loading.value = true;
  error.value = '';
  try {
    const resp = await api.get('/commentaires?limit=100');
    const data = resp.data?.data || resp.data || [];
    comments.value = Array.isArray(data) ? data : [];
  } catch (e) {
    error.value = 'Impossible de charger les commentaires.';
    comments.value = [];
  } finally {
    loading.value = false;
  }
};

const moderateComment = async (id, action) => {
  try {
    const resp = await api.post(`/commentaires/${id}/moderate`, { action });
    successMessage.value = action === 'approve' ? 'Commentaire approuvé' : 'Commentaire rejeté';
    setTimeout(() => { successMessage.value = ''; }, 3000);
    await fetchComments();
  } catch (e) {
    error.value = e.response?.data?.message || 'Erreur lors de la modération';
    setTimeout(() => { error.value = ''; }, 3000);
  }
};

const deleteComment = async (id) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) return;
  try {
    await api.delete(`/commentaires/${id}`);
    successMessage.value = 'Commentaire supprimé';
    setTimeout(() => { successMessage.value = ''; }, 3000);
    await fetchComments();
  } catch (e) {
    error.value = 'Erreur lors de la suppression';
    setTimeout(() => { error.value = ''; }, 3000);
  }
};

const truncate = (text, length) => {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
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

onMounted(fetchComments);
</script>

<style scoped>
.admin-commentaires-page {
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
  vertical-align: top;
}

.admin-table tbody tr:hover {
  background: rgba(255, 243, 247, 0.5);
}

.comment-text {
  max-width: 300px;
}

.comment-text div {
  max-height: 60px;
  overflow: hidden;
  line-height: 1.4;
}

.rating-stars {
  display: flex;
  gap: 2px;
  font-size: 14px;
}

.status-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 12px;
}

.status-approved {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
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
}

.btn-approve {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.btn-approve:hover {
  background: #c3e6cb;
  transform: translateY(-1px);
}

.btn-reject {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.btn-reject:hover {
  background: #f5c6cb;
  transform: translateY(-1px);
}

.btn-delete {
  background: #ffe6e6;
  color: #c81e32;
  border: 1px solid #ffcad0;
}

.btn-delete:hover {
  background: #ffcad0;
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
