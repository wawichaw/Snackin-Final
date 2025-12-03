<template>
  <div class="biscuit-edit-page">
    <h1>Modifier : {{ biscuit?.nom_biscuit || '...' }}</h1>
    
    <div v-if="loading" class="loading-card">Chargement...</div>
    <div v-else-if="error" class="error-alert">
      <ul>
        <li v-for="(err, idx) in errorMessages" :key="idx">{{ err }}</li>
      </ul>
    </div>

    <form v-if="biscuit" @submit.prevent="submit" class="biscuit-edit-card" enctype="multipart/form-data">
      <div class="form-group">
        <label class="form-label">Nom</label>
        <input type="text" v-model="form.nom_biscuit" class="form-control" required>
      </div>

      <div class="form-group">
        <label class="form-label">Prix</label>
        <input type="number" step="0.01" v-model="form.prix" class="form-control" required>
      </div>

      <div class="form-group">
        <label class="form-label">Description</label>
        <textarea v-model="form.description" class="form-control" rows="3"></textarea>
      </div>

      <div class="form-group">
        <label class="form-label">Saveur</label>
        <select v-model="form.saveur_id" class="form-control" required>
          <option value="" disabled>Sélectionner une saveur…</option>
          <option v-for="s in saveurs" :key="s.id" :value="s.id">
            {{ (s.emoji || '🍪') + ' ' + capitalize(s.nom_saveur) }}
          </option>
        </select>
        <small class="text-muted">Choix imposé — pas de saisie libre.</small>
      </div>

      <div class="form-group">
        <label class="form-label">Nouvelle image</label>
        <input type="file" @change="handleFileChange" class="form-control" accept="image/*">
        <small class="text-muted">Formats conseillés : JPG/PNG, ~1–2 Mo.</small>
        <div v-if="biscuit.image" class="current-image">
          <p>Image actuelle :</p>
          <img :src="getImageUrl(`/Contenu/img/${biscuit.image}`)" alt="Current" style="max-width: 200px; border-radius: 8px;">
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn primary" :disabled="saving">
          {{ saving ? 'Mise à jour...' : 'Mettre à jour' }}
        </button>
        <RouterLink to="/biscuits" class="btn outline">Annuler</RouterLink>
      </div>
    </form>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import { RouterLink, useRouter, useRoute } from 'vue-router';
import api from '../axios';

const router = useRouter();
const route = useRoute();
const saveurs = ref([]);
const biscuit = ref(null);
const loading = ref(true);
const saving = ref(false);
const error = ref('');
const form = reactive({
  nom_biscuit: '',
  prix: '',
  description: '',
  saveur_id: '',
  image: null,
});

const errorMessages = ref([]);

const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const getImageUrl = (path) => {
  return path.startsWith('/') ? path : `/${path}`;
};

const handleFileChange = (e) => {
  form.image = e.target.files[0];
};

const submit = async () => {
  error.value = '';
  errorMessages.value = [];
  saving.value = true;

  try {
    const formData = new FormData();
    formData.append('nom_biscuit', form.nom_biscuit);
    formData.append('prix', form.prix);
    formData.append('description', form.description);
    formData.append('saveur_id', form.saveur_id);
    if (form.image) {
      formData.append('image', form.image);
    }

    await api.put(`/biscuits/${route.params.id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    router.push('/biscuits');
  } catch (e) {
    if (e.response?.data?.errors) {
      const errors = e.response.data.errors;
      errorMessages.value = Object.values(errors).flat();
    } else {
      errorMessages.value = [e.response?.data?.message || 'Erreur lors de la mise à jour'];
    }
    error.value = 'Erreur';
  } finally {
    saving.value = false;
  }
};

onMounted(async () => {
  try {
    const [biscuitResp, saveursResp] = await Promise.all([
      api.get(`/biscuits/${route.params.id}`),
      api.get('/saveurs'),
    ]);
    
    biscuit.value = biscuitResp.data?.data || biscuitResp.data;
    saveurs.value = saveursResp.data?.data || saveursResp.data || [];
    
    if (biscuit.value) {
      form.nom_biscuit = biscuit.value.nom_biscuit || '';
      form.prix = biscuit.value.prix || '';
      form.description = biscuit.value.description || '';
      form.saveur_id = biscuit.value.saveur_id || '';
    }
  } catch (e) {
    console.error('Failed to fetch data', e);
    error.value = 'Erreur';
    errorMessages.value = ['Impossible de charger les données'];
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.biscuit-edit-page {
  max-width: 800px;
  margin: 34px auto;
  padding: 0 20px;
}

.biscuit-edit-page h1 {
  font-size: clamp(28px, 4vw, 42px);
  color: #a0162b;
  margin-bottom: 24px;
}

.loading-card {
  text-align: center;
  padding: 40px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 22px;
  border: 1px solid rgba(160, 22, 43, .08);
}

.error-alert {
  background: #f8d7da;
  color: #721c24;
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 20px;
}

.error-alert ul {
  margin: 0;
  padding-left: 20px;
}

.biscuit-edit-card {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 8px 32px rgba(236, 72, 153, 0.15);
  border: 2px solid #f7c6de;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #2a1620;
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
}

.form-control:focus {
  outline: none;
  border-color: #ec4899;
  box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
}

.text-muted {
  color: #666;
  font-size: 14px;
}

.current-image {
  margin-top: 10px;
}

.current-image p {
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 24px;
}
</style>

