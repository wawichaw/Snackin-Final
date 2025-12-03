<template>
  <div class="biscuit-edit-page">
    <h1>Nouveau biscuit</h1>
    
    <div v-if="error" class="error-alert">
      <ul>
        <li v-for="(err, idx) in errorMessages" :key="idx">{{ err }}</li>
      </ul>
    </div>

    <form @submit.prevent="submit" class="biscuit-edit-card" enctype="multipart/form-data">
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
      </div>

      <div class="form-group">
        <label class="form-label">Image</label>
        <input type="file" @change="handleFileChange" class="form-control" accept="image/*">
        <small class="text-muted">Formats conseillés : JPG/PNG, ~1–2 Mo.</small>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn primary" :disabled="loading">
          {{ loading ? 'Enregistrement...' : 'Enregistrer' }}
        </button>
        <RouterLink to="/biscuits" class="btn outline">Annuler</RouterLink>
      </div>
    </form>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import api from '../axios';

const router = useRouter();
const saveurs = ref([]);
const loading = ref(false);
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

const handleFileChange = (e) => {
  form.image = e.target.files[0];
};

const submit = async () => {
  error.value = '';
  errorMessages.value = [];
  loading.value = true;

  try {
    const formData = new FormData();
    formData.append('nom_biscuit', form.nom_biscuit);
    formData.append('prix', form.prix);
    formData.append('description', form.description);
    formData.append('saveur_id', form.saveur_id);
    if (form.image) {
      formData.append('image', form.image);
    }

    await api.post('/biscuits', formData, {
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
      errorMessages.value = [e.response?.data?.message || 'Erreur lors de la création'];
    }
    error.value = 'Erreur';
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  try {
    const resp = await api.get('/saveurs');
    saveurs.value = resp.data?.data || resp.data || [];
  } catch (e) {
    console.error('Failed to fetch saveurs', e);
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

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 24px;
}
</style>

