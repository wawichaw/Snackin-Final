<template>
  <div class="commande-page">
    <!-- Hero avec images -->
    <section class="commande-hero">
      <div class="hero-grid">
        <img :src="getImageUrl('/Contenu/img/commande-1.png')" alt="Boîte de biscuits 1">
        <img :src="getImageUrl('/Contenu/img/commande-2.png')" alt="Boîte de biscuits 2">
        <img :src="getImageUrl('/Contenu/img/commande-3.png')" alt="Boîte de biscuits 3">
        <img :src="getImageUrl('/Contenu/img/commande-4.png')" alt="Préparation de biscuits">
      </div>
      <div class="smile s1">😊</div>
      <div class="smile s2">😊</div>
      <div class="smile s3">😊</div>
    </section>

    <div class="commande-container">
      <h1>Commander des boîtes de biscuits</h1>

      <div v-if="error" class="alert alert-danger">
        <p>{{ error }}</p>
      </div>
      <div v-if="success" class="alert alert-success">
        <p>{{ success }}</p>
      </div>

      <div class="commande-form">
        <!-- Taille de boîte -->
        <div class="form-section">
          <h2>Choisissez la taille de votre boîte</h2>
          <div class="boite-options">
            <label v-for="b in boxSizes" :key="b.value" class="boite-option">
              <input type="radio" name="taille_boite" :value="b.value" v-model.number="boxSize" required>
              <div class="boite-card">
                <div class="boite-icon">{{ b.icon }}</div>
                <h3>{{ b.label }}</h3>
                <p>{{ b.desc }}</p>
                <span class="prix">{{ b.price }} $</span>
              </div>
            </label>
          </div>
        </div>

        <!-- Saveurs + Quantités -->
        <div class="form-section">
          <h2>Choisissez vos saveurs et quantités</h2>
          <p class="info-text">
            Sélectionnez les saveurs et indiquez la quantité pour chaque biscuit.
            Le total doit correspondre à la taille de boîte choisie.
          </p>

          <div v-if="loadingBiscuits" class="loading">Chargement des biscuits...</div>
          <div v-else-if="!biscuits.length" class="alert alert-warning">
            Aucun biscuit disponible pour le moment.
          </div>
          <div v-else class="saveurs-grid">
            <div v-for="b in biscuits" :key="b.id" class="saveur-item">
              <div class="saveur-card">
                <div class="saveur-top">
                  <div>
                    <h4>{{ b.nom_biscuit || b.nom || b.name }}</h4>
                    <span v-if="b.saveur" class="saveur-chip">
                      {{ getSaveurEmoji(b.saveur) }} {{ getSaveurName(b) }}
                    </span>
                  </div>
                  <span class="prix-biscuit">{{ formatPrice(b.prix) }} $</span>
                </div>
                <div v-if="b.image" class="biscuit-image">
                  <img :src="getImageUrl(`/Contenu/img/${b.image}`)" :alt="b.nom_biscuit || b.nom">
                </div>
                <div class="quantite-control">
                  <label>Quantité</label>
                  <div class="qty-row">
                    <button type="button" class="qty-btn minus" @click="dec(b.id)" aria-label="Retirer 1">−</button>
                    <input
                      type="number"
                      min="0"
                      :max="boxSize || 12"
                      v-model.number="quantites[b.id]"
                      @input="clamp(b.id)"
                      class="quantite-input"
                    >
                    <button type="button" class="qty-btn plus" @click="inc(b.id)" aria-label="Ajouter 1">+</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="total-info">
            <p>Total sélectionné :
              <span id="total-selectionne" :class="getTotalClass">{{ totalSelected }}</span> /
              <span id="taille-max">{{ boxSize || 0 }}</span> biscuits
            </p>
            <p class="prix-total">
              Prix total : <span id="prix-total">{{ currentPrice }} $</span>
            </p>
          </div>
        </div>

        <!-- Infos client -->
        <div class="form-section">
          <h2>Vos informations</h2>
          <div class="form-row">
            <label>
              Nom complet
              <input type="text" v-model="form.nom_client" required>
            </label>
            <label>
              Email
              <input type="email" v-model="form.email_client" required>
            </label>
          </div>
        </div>

        <!-- CTA -->
        <div class="form-actions">
          <button type="button" class="btn-large" :disabled="sending || !canSubmit" @click="submit">
            {{ sending ? 'Envoi...' : 'Passer la commande' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import api from '../axios';
import { useAuth } from '../composables/auth';

// Force recompilation

const { user } = useAuth();

const biscuits = ref([]);
const loadingBiscuits = ref(false);
const boxSize = ref(0);
const quantites = reactive({});
const sending = ref(false);
const error = ref('');
const success = ref('');
const form = reactive({ nom_client: '', email_client: '' });

const boxSizes = [
  { value: 4, label: 'Boîte de 4', icon: '🧁', desc: 'Parfait pour une dégustation', price: 15 },
  { value: 6, label: 'Boîte de 6', icon: '🍪', desc: 'Idéal pour partager', price: 20 },
  { value: 12, label: 'Boîte de 12', icon: '🎁', desc: 'Pour les gourmands', price: 35 },
];

// Fonction pour obtenir l'URL des images
const getImageUrl = (path) => {
  return path.startsWith('/') ? path : `/${path}`;
};

// Fonction pour obtenir le nom de la saveur
const getSaveurName = (biscuit) => {
  if (biscuit.saveur?.nom_saveur) return biscuit.saveur.nom_saveur;
  if (biscuit.nom_saveur) return biscuit.nom_saveur;
  return 'Classique';
};

// Fonction pour obtenir l'emoji de la saveur
const getSaveurEmoji = (saveur) => {
  if (!saveur) return '🍪';
  const nom = (saveur.nom_saveur || '').toLowerCase();
  const emojiMap = {
    'chocolat': '🍫',
    'vanille': '🌿',
    'caramel': '🍮',
    'fraise': '🍓',
    'citron': '🍋',
    'noix': '🥜',
    'coco': '🥥',
  };
  return emojiMap[nom] || '🍪';
};

// Formater le prix
const formatPrice = (prix) => {
  if (!prix) return '0.00';
  return Number(prix).toFixed(2);
};

const currentPrice = computed(() => {
  const found = boxSizes.find((b) => b.value === boxSize.value);
  return found ? found.price.toFixed(2) : '0.00';
});

const totalSelected = computed(() => Object.values(quantites).reduce((s, v) => s + (parseInt(v) || 0), 0));

const canSubmit = computed(() => {
  return boxSize.value > 0 && totalSelected.value === boxSize.value && form.nom_client && form.email_client;
});

const getTotalClass = computed(() => {
  if (!boxSize.value) return '';
  if (totalSelected.value === boxSize.value) return 'total-ok';
  if (totalSelected.value > boxSize.value) return 'total-danger';
  return 'total-warn';
});

const inc = (id) => {
  if (!boxSize.value) return;
  const current = parseInt(quantites[id]) || 0;
  if (totalSelected.value < boxSize.value) {
    quantites[id] = current + 1;
  }
};

const dec = (id) => {
  const current = parseInt(quantites[id]) || 0;
  quantites[id] = Math.max(0, current - 1);
};

const clamp = (id) => {
  let val = parseInt(quantites[id]) || 0;
  val = Math.max(0, val);
  const overflow = totalSelected.value - val;
  if (boxSize.value && totalSelected.value > boxSize.value) {
    const extra = totalSelected.value - boxSize.value;
    val = Math.max(0, val - extra);
  }
  quantites[id] = val;
};

const fetchBiscuits = async () => {
  loadingBiscuits.value = true;
  try {
    const resp = await api.get('/biscuits?limit=50');
    let data = [];
    if (resp.data?.data && Array.isArray(resp.data.data)) {
      data = resp.data.data;
    } else if (Array.isArray(resp.data)) {
      data = resp.data;
    }
    biscuits.value = data.filter(b => b && b.id);
    biscuits.value.forEach((b) => (quantites[b.id] = 0));
    console.log('Biscuits chargés pour commande:', biscuits.value.length);
  } catch (e) {
    console.error('Erreur chargement biscuits:', e);
    biscuits.value = [];
    error.value = 'Erreur lors du chargement des biscuits.';
  } finally {
    loadingBiscuits.value = false;
  }
};

const submit = async () => {
  error.value = '';
  success.value = '';
  if (!boxSize.value) {
    error.value = 'Choisissez une taille de boite.';
    return;
  }
  if (totalSelected.value !== boxSize.value) {
    error.value = 'La somme des quantites doit egaler la taille de la boite.';
    return;
  }
  if (!form.nom_client || !form.email_client) {
    error.value = 'Nom et email requis.';
    return;
  }
  const quantitesFiltrees = {};
  Object.entries(quantites).forEach(([id, qty]) => {
    if (qty && Number(qty) > 0) quantitesFiltrees[id] = Number(qty);
  });
  const payload = {
    taille_boite: String(boxSize.value), // Convertir en string comme attendu par le backend
    quantites: quantitesFiltrees,
    nom_client: form.nom_client.trim(),
    email_client: form.email_client.trim(),
  };
  sending.value = true;
  try {
    const resp = await api.post('/commandes', payload);
    success.value = 'Votre commande a été enregistrée. Merci !';
    // Réinitialiser le formulaire
    boxSize.value = 0;
    Object.keys(quantites).forEach(key => quantites[key] = 0);
    form.nom_client = user.value?.name || '';
    form.email_client = user.value?.email || '';
  } catch (e) {
    console.error('Erreur commande:', e);
    if (e.response?.data?.errors) {
      const errors = e.response.data.errors;
      error.value = Object.values(errors).flat().join(', ');
    } else {
      error.value = e.response?.data?.message || 'Échec de la commande.';
    }
  } finally {
    sending.value = false;
  }
};

onMounted(() => {
  if (user.value) {
    form.nom_client = user.value.name || '';
    form.email_client = user.value.email || '';
  }
  fetchBiscuits();
});
</script>

<style scoped>
:root {
  --ink: #2a1620;
  --ink-soft: #694256;
  --ring: #f7c6de;
  --cta: #ec4899;
  --cta-dark: #db2777;
  --ok: #16a34a;
  --warn: #eab308;
  --danger: #dc2626;
}

.commande-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #fff1f7 0%, #ffe6ee 100%);
}

/* Hero */
.commande-hero {
  position: relative;
  padding: 28px 0 10px;
  background: linear-gradient(180deg, #fff1f7 0%, #ffe6ee 100%);
  overflow: hidden;
}

.hero-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 16px;
}

.hero-grid img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 18px;
  border: 1px solid var(--ring);
  box-shadow: 0 8px 20px rgba(236, 72, 153, 0.12);
}

.smile {
  position: absolute;
  font-size: 28px;
  color: #e11d48;
  opacity: 0.35;
  animation: floaty 9s ease-in-out infinite;
  filter: drop-shadow(0 4px 8px rgba(225, 29, 72, 0.15));
  user-select: none;
  pointer-events: none;
}

.s1 { top: 14%; left: 6%; animation-delay: 0s; }
.s2 { top: 8%; right: 10%; animation-delay: 1.5s; transform: scale(1.2); }
.s3 { bottom: 6%; left: 12%; animation-delay: 3s; transform: scale(0.9) rotate(-12deg); }

@keyframes floaty {
  0% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-12px) rotate(6deg); }
  100% { transform: translateY(0) rotate(0deg); }
}

/* Container */
.commande-container {
  max-width: 1040px;
  margin: 24px auto 40px;
  padding: 0 16px;
}

.commande-container h1 {
  text-align: center;
  font-weight: 800;
  color: var(--cta-dark);
  margin-bottom: 24px;
}

/* Form */
.commande-form {
  background: #fff;
  border: 1px solid var(--ring);
  border-radius: 22px;
  padding: 22px 20px;
  box-shadow: 0 10px 26px rgba(236, 72, 153, 0.12);
}

.form-section {
  margin-bottom: 28px;
}

.form-section h2 {
  font-weight: 800;
  color: var(--ink);
  margin-bottom: 10px;
}

.info-text {
  color: var(--ink-soft);
  margin-bottom: 16px;
}

/* Alertes */
.alert {
  padding: 12px 16px;
  border-radius: 12px;
  margin-bottom: 16px;
}

.alert-danger {
  background: #fee2e2;
  border: 1px solid #fecaca;
  color: #991b1b;
}

.alert-success {
  background: #dcfce7;
  border: 1px solid #bbf7d0;
  color: #166534;
}

.alert-warning {
  background: #fef3c7;
  border: 1px solid #fde68a;
  color: #92400e;
}

/* Boîtes */
.boite-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
}

.boite-option {
  display: block;
}

.boite-option input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.boite-card {
  border: 1px solid var(--ring);
  border-radius: 18px;
  padding: 16px 14px;
  background: #fff;
  text-align: center;
  transition: all 0.2s ease;
  box-shadow: 0 8px 18px rgba(236, 72, 153, 0.10);
  cursor: pointer;
}

.boite-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(236, 72, 153, 0.15);
}

.boite-option input:checked + .boite-card {
  border-color: var(--cta);
  box-shadow: 0 12px 26px rgba(236, 72, 153, 0.18);
  transform: translateY(-2px);
}

.boite-icon {
  font-size: 26px;
  margin-bottom: 6px;
}

.boite-card h3 {
  margin: 8px 0;
  font-weight: 800;
  color: var(--ink);
}

.boite-card p {
  margin: 4px 0;
  color: var(--ink-soft);
  font-size: 14px;
}

.boite-card .prix {
  display: inline-block;
  margin-top: 6px;
  font-weight: 800;
  color: var(--cta-dark);
  background: #ffe4f0;
  border: 1px solid var(--ring);
  padding: 4px 10px;
  border-radius: 999px;
}

/* Grille saveurs */
.saveurs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 14px;
}

.saveur-card {
  border: 1px solid var(--ring);
  border-radius: 16px;
  padding: 12px 12px 14px;
  background: #fff;
  box-shadow: 0 8px 18px rgba(236, 72, 153, 0.08);
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.saveur-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(236, 72, 153, 0.12);
}

.saveur-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.saveur-top h4 {
  margin: 0;
  font-weight: 800;
  color: var(--ink);
  font-size: 16px;
}

.saveur-chip {
  display: inline-block;
  font-size: 12px;
  color: var(--ink-soft);
  margin-top: 4px;
}

.prix-biscuit {
  font-weight: 800;
  color: var(--cta-dark);
  white-space: nowrap;
}

.biscuit-image {
  width: 100%;
  height: 120px;
  overflow: hidden;
  border-radius: 12px;
  margin: 8px 0;
}

.biscuit-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.quantite-control label {
  font-weight: 600;
  color: var(--ink-soft);
  font-size: 14px;
  margin-bottom: 6px;
  display: block;
}

.qty-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.qty-btn {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  border: 1px solid var(--ring);
  background: #fff;
  font-weight: 900;
  line-height: 0;
  cursor: pointer;
  box-shadow: 0 6px 14px rgba(236, 72, 153, 0.10);
  transition: all 0.2s ease;
  font-size: 18px;
  color: var(--cta-dark);
}

.qty-btn:hover {
  background: #fff0f6;
  border-color: var(--cta);
  transform: scale(1.05);
}

.qty-btn:active {
  transform: scale(0.95);
}

.quantite-input {
  width: 72px;
  text-align: center;
  border: 1px solid var(--ring);
  border-radius: 10px;
  padding: 8px;
  font-weight: 600;
  font-size: 14px;
}

.quantite-input:focus {
  outline: none;
  border-color: var(--cta);
  box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
}

/* Total */
.total-info {
  text-align: center;
  margin-top: 16px;
  font-weight: 700;
  padding: 16px;
  background: #fff8f9;
  border-radius: 12px;
  border: 1px solid var(--ring);
}

.total-info p {
  margin: 8px 0;
  color: var(--ink);
}

#total-selectionne {
  font-weight: 900;
  font-size: 18px;
}

.total-ok {
  color: var(--ok);
}

.total-warn {
  color: var(--warn);
}

.total-danger {
  color: var(--danger);
}

.prix-total {
  font-size: 18px;
  font-weight: bold;
  color: var(--ink);
  margin-top: 10px;
}

#prix-total {
  color: var(--cta-dark);
  font-size: 20px;
}

/* Infos client */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.form-row label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-weight: 600;
  color: var(--ink);
}

.form-row input {
  border: 1px solid var(--ring);
  border-radius: 12px;
  padding: 10px 12px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.form-row input:focus {
  outline: none;
  border-color: var(--cta);
  box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
}

/* CTA */
.form-actions {
  text-align: center;
  margin-top: 24px;
}

.btn-large {
  border-radius: 999px;
  padding: 12px 26px;
  font-weight: 800;
  font-size: 1.05rem;
  background: var(--cta);
  border: none;
  color: #fff;
  box-shadow: 0 10px 26px rgba(236, 72, 153, 0.20);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-large:hover:not(:disabled) {
  background: var(--cta-dark);
  transform: translateY(-1px);
  box-shadow: 0 12px 30px rgba(236, 72, 153, 0.25);
}

.btn-large:active:not(:disabled) {
  transform: translateY(0);
}

.btn-large:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  padding: 24px;
  color: var(--ink-soft);
}
</style>
