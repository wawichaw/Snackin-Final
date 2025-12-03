<template>
  <div class="page-shell">
    <div class="section-header">
      <div>
        <p class="eyebrow">Avis clients</p>
        <h1>Commentaires Snackin</h1>
        <p class="muted">Ajoutez un avis sur vos biscuits preferes et lisez ceux de la communaute.</p>
      </div>
      <div class="pill-info">Vue 3 + API Laravel</div>
    </div>

    <div class="two-col">
      <div class="panel">
        <h2>Laisser un commentaire</h2>
        <form class="stack" @submit.prevent="submit">
          <div class="field">
            <label>Biscuit</label>
            <select v-model="form.biscuit_id" required>
              <option value="">Choisissez un biscuit</option>
              <option v-for="b in biscuits" :key="b.id" :value="b.id">
                {{ b.nom_biscuit || b.nom || b.name || `Biscuit #${b.id}` }}
              </option>
            </select>
            <small v-if="biscuits.length === 0" style="color: #999; font-size: 12px;">
              Chargement des biscuits...
            </small>
            <small v-else style="color: #666; font-size: 12px;">
              {{ biscuits.length }} biscuit(s) disponible(s)
            </small>
          </div>

          <div v-if="isGuest" class="two">
            <div class="field">
              <label>Votre nom</label>
              <input v-model="form.nom_visiteur" required />
            </div>
            <div class="field">
              <label>Votre email</label>
              <input type="email" v-model="form.email_visiteur" />
            </div>
          </div>

          <div class="two">
            <div class="field">
              <label>Note</label>
              <select v-model="form.note">
                <option value="">Choisissez une note</option>
                <option v-for="n in [1,2,3,4,5]" :key="n" :value="n">{{ '★'.repeat(n) }} ({{ n }})</option>
              </select>
            </div>
            <div class="field">
              <label>Date (auto)</label>
              <input disabled value="Automatique" />
            </div>
          </div>

          <div class="field">
            <label>Votre commentaire</label>
            <textarea v-model="form.texte" rows="4" required placeholder="Partagez votre experience..."></textarea>
          </div>

          <div class="actions">
            <button class="btn primary" :disabled="sending">{{ sending ? 'Envoi...' : 'Publier le commentaire' }}</button>
            <p v-if="error" class="text-error">{{ error }}</p>
            <p v-if="success" class="text-success">{{ success }}</p>
          </div>
        </form>
      </div>

      <div class="panel">
        <div class="panel-head">
          <div>
            <p class="eyebrow">Recents</p>
            <h2>Commentaires</h2>
          </div>
          <button class="btn ghost" type="button" @click="fetchComments">Rafraichir</button>
        </div>

        <div v-if="loadingList" class="card">Chargement...</div>
        <div v-else-if="!comments.length" class="card">Aucun commentaire pour le moment.</div>
        <div v-else class="stack">
          <article v-for="c in displayedComments" :key="c.id" class="comment-card">
            <div class="comment-top">
              <div class="avatar">{{ (c.nom_affiche || c.auteur_affiche || c.nom_visiteur || c.nom || 'A').toString().charAt(0).toUpperCase() }}</div>
              <div>
                <h3>{{ c.nom_affiche || c.auteur_affiche || c.nom_visiteur || c.nom || 'Anonyme' }}</h3>
                <p class="muted">Sur {{ c.biscuit?.nom_biscuit || c.biscuit?.nom || 'un biscuit' }}</p>
              </div>
              <div v-if="c.note" class="rating">{{ '★'.repeat(Number(c.note)) }}</div>
            </div>
            <p class="comment-body">{{ c.texte || c.contenu || c.message || c.content }}</p>
            <div class="comment-meta">
              <span>{{ formatDate(c.created_at) }}</span>
            </div>
          </article>
          
          <div v-if="hasMoreComments && !showAllComments" class="show-more-container">
            <button @click="showAllComments = true" class="btn-show-more">
              Voir tous les commentaires ({{ comments.length }})
            </button>
          </div>
          
          <div v-if="showAllComments && hasMoreComments" class="show-more-container">
            <button @click="showAllComments = false" class="btn-show-more">
              Afficher moins
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import axios from 'axios';
import api from '../axios';
import { useAuth } from '../composables/auth';

const comments = ref([]);
const biscuits = ref([]);
const loadingList = ref(true);
const sending = ref(false);
const error = ref('');
const success = ref('');
const showAllComments = ref(false);
const initialLimit = 4;

const form = reactive({
  biscuit_id: '',
  texte: '',
  note: '',
  nom_visiteur: '',
  email_visiteur: '',
});

const { user } = useAuth();
const isGuest = computed(() => !user.value);

const fetchBiscuits = async () => {
  try {
    const resp = await api.get('/biscuits?limit=50');
    // Gérer différentes structures de réponse
    let data = [];
    if (resp.data?.data && Array.isArray(resp.data.data)) {
      data = resp.data.data;
    } else if (Array.isArray(resp.data)) {
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
    biscuits.value = data.filter(b => b && b.id);
    console.log('Biscuits chargés pour commentaires:', biscuits.value.length);
    console.log('Premier biscuit:', biscuits.value[0]);
  } catch (e) {
    console.error('Erreur chargement biscuits:', e);
    console.error('Erreur response:', e.response?.data);
    biscuits.value = [];
  }
};

const fetchComments = async () => {
  loadingList.value = true;
  try {
    const resp = await api.get('/commentaires?limit=20');
    // Gérer différentes structures de réponse
    let data = [];
    if (resp.data?.data && Array.isArray(resp.data.data)) {
      data = resp.data.data;
    } else if (Array.isArray(resp.data)) {
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
    comments.value = data.filter(c => c && c.id);
    // Trier par date décroissante pour avoir les plus récents en premier
    comments.value.sort((a, b) => {
      const dateA = new Date(a.created_at || 0);
      const dateB = new Date(b.created_at || 0);
      return dateB - dateA;
    });
    console.log('Commentaires chargés:', comments.value.length);
    console.log('Premier commentaire:', comments.value[0]);
  } catch (e) {
    console.error('Erreur chargement commentaires:', e);
    comments.value = [];
  } finally {
    loadingList.value = false;
  }
};

const submit = async () => {
  error.value = '';
  success.value = '';
  if (!form.biscuit_id || !form.texte) {
    error.value = 'Merci de choisir un biscuit et de saisir un commentaire.';
    return;
  }
  const payload = {
    biscuit_id: parseInt(form.biscuit_id),
    texte: form.texte.trim(),
    note: form.note ? parseInt(form.note) : null,
  };
  if (isGuest.value) {
    payload.nom_visiteur = form.nom_visiteur?.trim() || '';
    payload.email_visiteur = form.email_visiteur?.trim() || '';
  }
  sending.value = true;
  try {
    const resp = await api.post('/commentaires', payload);
    console.log('Commentaire créé:', resp.data);
    success.value = 'Commentaire publié avec succès !';
    // Réinitialiser le formulaire
    form.biscuit_id = '';
    form.texte = '';
    form.note = '';
    if (isGuest.value) {
      form.nom_visiteur = '';
      form.email_visiteur = '';
    }
    // Recharger immédiatement les commentaires
    await fetchComments();
    // Garder le message de succès pendant 3 secondes
    setTimeout(() => {
      success.value = '';
    }, 3000);
  } catch (e) {
    console.error('Erreur publication commentaire:', e);
    console.error('Erreur response:', e.response?.data);
    if (e.response?.data?.errors) {
      const errors = e.response.data.errors;
      error.value = Object.values(errors).flat().join(', ');
    } else {
      error.value = e.response?.data?.message || 'Échec de publication.';
    }
  } finally {
    sending.value = false;
  }
};

const displayedComments = computed(() => {
  if (showAllComments.value) return comments.value;
  return comments.value.slice(0, initialLimit);
});

const hasMoreComments = computed(() => comments.value.length > initialLimit);

const formatDate = (str) => {
  if (!str) return '';
  try {
    const d = new Date(str);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return str;
  }
};

onMounted(() => {
  fetchBiscuits();
  fetchComments();
});
</script>

<style scoped>
.show-more-container {
  text-align: center;
  margin-top: 20px;
  padding: 20px;
}

.btn-show-more {
  background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
  color: white;
  padding: 14px 28px;
  border: none;
  border-radius: 999px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(236, 72, 153, 0.35);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
  box-shadow: 0 12px 32px rgba(236, 72, 153, 0.45);
}

.btn-show-more:active {
  transform: translateY(-1px);
}
</style>
