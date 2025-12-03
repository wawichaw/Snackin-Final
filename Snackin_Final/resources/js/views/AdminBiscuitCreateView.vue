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
    if (!form.saveur_id) {
      errorMessages.value = ['Veuillez sélectionner une saveur'];
      error.value = 'Erreur';
      loading.value = false;
      return;
    }

    const formData = new FormData();
    formData.append('nom_biscuit', form.nom_biscuit);
    formData.append('prix', parseFloat(form.prix));
    formData.append('description', form.description || '');
    formData.append('saveur_id', parseInt(form.saveur_id));
    if (form.image) {
      formData.append('image', form.image);
    }

    const resp = await api.post('/biscuits', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    router.push('/biscuits');
  } catch (e) {
    console.error('Erreur création biscuit:', e);
    if (e.response?.data?.errors) {
      const errors = e.response.data.errors;
      errorMessages.value = Object.values(errors).flat();
    } else if (e.response?.data?.message) {
      errorMessages.value = [e.response.data.message];
    } else {
      errorMessages.value = ['Erreur lors de la création. Vérifiez que vous êtes bien connecté en tant qu\'admin.'];
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
  background: linear-gradient(180deg, #fff 0%, #fff8f9 100%);
  border-radius: 24px;
  padding: 48px;
  box-shadow: 0 20px 60px rgba(236, 72, 153, 0.2);
  border: 2px solid #f7c6de;
  animation: fadeIn 0.6s ease-out;
  transition: all 0.3s ease;
}

.biscuit-edit-card:hover {
  box-shadow: 0 24px 72px rgba(236, 72, 153, 0.25);
}

.form-group {
  margin-bottom: 24px;
  animation: fadeIn 0.5s ease-out;
}

.form-group:nth-child(1) { animation-delay: 0.1s; }
.form-group:nth-child(2) { animation-delay: 0.2s; }
.form-group:nth-child(3) { animation-delay: 0.3s; }
.form-group:nth-child(4) { animation-delay: 0.4s; }
.form-group:nth-child(5) { animation-delay: 0.5s; }

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 700;
  color: #2a1620;
  font-size: 15px;
}

.form-control {
  width: 100%;
  padding: 14px 18px;
  border: 2px solid rgba(160, 22, 43, 0.15);
  border-radius: 12px;
  font-size: 16px;
  background: #fff;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: #1f0f15;
}

.form-control:focus {
  outline: none;
  border-color: #ec4899;
  box-shadow: 0 0 0 4px rgba(236, 72, 153, 0.15);
  transform: translateY(-1px);
  background: #fff;
}

.form-control::placeholder {
  color: rgba(31, 15, 21, 0.4);
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

