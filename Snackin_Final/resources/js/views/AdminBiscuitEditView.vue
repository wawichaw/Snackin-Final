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
          <option v-for="s in saveurs" :key="s.id" :value="String(s.id)">
            {{ (s.emoji || '🍪') + ' ' + capitalize(s.nom_saveur || s.nom) }}
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
    // Debug: afficher l'état du formulaire avant validation
    console.log('=== ÉTAT DU FORMULAIRE AVANT ENVOI ===');
    console.log('form.nom_biscuit:', form.nom_biscuit, 'type:', typeof form.nom_biscuit);
    console.log('form.prix:', form.prix, 'type:', typeof form.prix);
    console.log('form.description:', form.description, 'type:', typeof form.description);
    console.log('form.saveur_id:', form.saveur_id, 'type:', typeof form.saveur_id);
    console.log('form.image:', form.image);
    console.log('=====================================');

    // Validation côté client
    if (!form.nom_biscuit || !form.nom_biscuit.trim()) {
      errorMessages.value = ['Le nom du biscuit est requis'];
      error.value = 'Erreur';
      saving.value = false;
      return;
    }

    if (!form.prix || form.prix === '' || isNaN(parseFloat(form.prix))) {
      errorMessages.value = ['Le prix est requis et doit être un nombre'];
      error.value = 'Erreur';
      saving.value = false;
      return;
    }

    if (!form.saveur_id || form.saveur_id === '' || form.saveur_id === null || form.saveur_id === undefined) {
      errorMessages.value = ['La saveur est requise'];
      error.value = 'Erreur';
      saving.value = false;
      return;
    }

    // Convertir les valeurs
    const prixNum = parseFloat(form.prix);
    const saveurIdNum = parseInt(form.saveur_id, 10);
    
    // Vérifier que les conversions ont réussi
    if (isNaN(prixNum) || prixNum <= 0) {
      errorMessages.value = ['Le prix doit être un nombre valide supérieur à 0'];
      error.value = 'Erreur';
      saving.value = false;
      return;
    }
    
    if (isNaN(saveurIdNum) || saveurIdNum <= 0) {
      errorMessages.value = ['La saveur doit être sélectionnée'];
      error.value = 'Erreur';
      saving.value = false;
      return;
    }

    // Si pas d'image, on peut envoyer en JSON (plus fiable avec PUT)
    // Sinon, on utilise FormData
    if (!form.image) {
      // Pas d'image, on peut utiliser JSON
      const payload = {
        nom_biscuit: form.nom_biscuit.trim(),
        prix: prixNum,
        description: form.description || '',
        saveur_id: saveurIdNum,
      };
      
      console.log('=== ENVOI EN JSON ===');
      console.log('Payload:', payload);
      console.log('===================');
      
      await api.put(`/biscuits/${route.params.id}`, payload);
    } else {
      // Avec image, on doit utiliser FormData
      const formData = new FormData();
      const nomBiscuit = form.nom_biscuit.trim();
      const prixStr = String(prixNum);
      const descriptionStr = form.description || '';
      const saveurIdStr = String(saveurIdNum);
      
      formData.append('nom_biscuit', nomBiscuit);
      formData.append('prix', prixStr);
      formData.append('description', descriptionStr);
      formData.append('saveur_id', saveurIdStr);
      formData.append('image', form.image);

      console.log('=== ENVOI EN FORMDATA (avec image) ===');
      for (let pair of formData.entries()) {
        console.log('FormData[' + pair[0] + '] =', pair[1], 'type:', typeof pair[1]);
      }
      console.log('=====================================');

      await api.put(`/biscuits/${route.params.id}`, formData);
    }

    router.push('/biscuits');
  } catch (e) {
    console.error('Erreur mise à jour biscuit:', e);
    if (e.response?.data?.errors) {
      const errors = e.response.data.errors;
      errorMessages.value = Object.values(errors).flat();
    } else if (e.response?.data?.message) {
      errorMessages.value = [e.response.data.message];
    } else {
      errorMessages.value = ['Erreur lors de la mise à jour'];
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
    
    // Extraire les données de la réponse
    biscuit.value = biscuitResp.data?.data || biscuitResp.data;
    saveurs.value = saveursResp.data?.data || saveursResp.data || [];
    
    if (biscuit.value) {
      form.nom_biscuit = biscuit.value.nom_biscuit || '';
      form.prix = biscuit.value.prix ? String(biscuit.value.prix) : '';
      form.description = biscuit.value.description || '';
      // S'assurer que saveur_id est bien récupéré (peut être dans saveur.id ou saveur_id)
      const saveurId = biscuit.value.saveur_id 
        ? biscuit.value.saveur_id 
        : (biscuit.value.saveur?.id ? biscuit.value.saveur.id : null);
      form.saveur_id = saveurId ? String(saveurId) : '';
      
      console.log('=== DONNÉES CHARGÉES ===');
      console.log('Biscuit complet:', biscuit.value);
      console.log('biscuit.value.saveur_id:', biscuit.value.saveur_id);
      console.log('biscuit.value.saveur?.id:', biscuit.value.saveur?.id);
      console.log('saveurId calculé:', saveurId);
      console.log('Form initialisé:', { 
        nom_biscuit: form.nom_biscuit,
        prix: form.prix,
        description: form.description,
        saveur_id: form.saveur_id,
        'saveur_id type': typeof form.saveur_id
      });
      console.log('Saveurs disponibles:', saveurs.value.map(s => ({ id: s.id, nom: s.nom_saveur || s.nom })));
      console.log('========================');
    } else {
      console.error('Biscuit non trouvé');
      error.value = 'Erreur';
      errorMessages.value = ['Biscuit non trouvé'];
    }
  } catch (e) {
    console.error('Failed to fetch data', e);
    console.error('Error response:', e.response?.data);
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

