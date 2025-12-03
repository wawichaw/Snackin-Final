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
              <option v-for="b in biscuits" :key="b.id" :value="b.id">{{ b.nom_biscuit || b.nom || b.name }}</option>
            </select>
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
              <div class="avatar">{{ (c.nom_affiche || c.nom_visiteur || c.nom || 'A').toString().charAt(0).toUpperCase() }}</div>
              <div>
                <h3>{{ c.nom_affiche || c.nom_visiteur || c.nom || 'Anonyme' }}</h3>
                <p class="muted">Sur {{ c.biscuit?.nom_biscuit || c.biscuit?.nom || 'un biscuit' }}</p>
              </div>
              <div v-if="c.note" class="rating">{{ '★'.repeat(Number(c.note)) }}</div>
            </div>
            <p class="comment-body">{{ c.texte || c.message || c.content }}</p>
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
    const resp = await axios.get('/api/biscuits');
    biscuits.value = resp.data || [];
  } catch (e) {
    biscuits.value = [];
  }
};

const fetchComments = async () => {
  loadingList.value = true;
  try {
    const resp = await axios.get('/api/commentaires?limit=20');
    comments.value = resp.data?.data || resp.data || [];
  } catch (e) {
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
    biscuit_id: form.biscuit_id,
    texte: form.texte,
    note: form.note,
  };
  if (isGuest.value) {
    payload.nom_visiteur = form.nom_visiteur;
    payload.email_visiteur = form.email_visiteur;
  }
  sending.value = true;
  try {
    await axios.post('/commentaires', payload);
    success.value = 'Commentaire publie.';
    form.texte = '';
    form.note = '';
    if (isGuest.value) {
      form.nom_visiteur = '';
      form.email_visiteur = '';
    }
    fetchComments();
  } catch (e) {
    error.value = e.response?.data?.message || 'Echec de publication.';
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
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(236, 72, 153, 0.3);
  transition: all 0.3s ease;
}

.btn-show-more:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(236, 72, 153, 0.4);
}
</style>
