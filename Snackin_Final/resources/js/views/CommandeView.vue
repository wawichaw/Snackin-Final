<template>
  <div class="page-shell">
    <div class="section-header">
      <div>
        <p class="eyebrow">Commande</p>
        <h1>Composer votre boite</h1>
        <p class="muted">Choisissez une taille de boite puis repartissez les biscuits. Prix fixe selon la taille.</p>
      </div>
      <div class="pill-info">Authentifie: {{ user ? user.name : 'non' }}</div>
    </div>

    <div class="stack">
      <div class="panel">
        <h2>1. Taille de boite</h2>
        <div class="box-grid">
          <label v-for="b in boxSizes" :key="b.value" class="box-card">
            <input type="radio" name="box" :value="b.value" v-model.number="boxSize" />
            <div>
              <p class="eyebrow">{{ b.label }}</p>
              <h3>{{ b.title }}</h3>
              <p class="muted">{{ b.desc }}</p>
              <span class="price">{{ b.price }} $</span>
            </div>
          </label>
        </div>
      </div>

      <div class="panel">
        <h2>2. Vos biscuits</h2>
        <p class="muted">Distribuez jusqu'a {{ boxSize || '...' }} biscuits. Total selectionne: {{ totalSelected }}.</p>
        <div class="cards-grid">
          <div v-for="b in biscuits" :key="b.id" class="card biscuit-card">
            <div class="card-head">
              <div>
                <h4>{{ b.nom_biscuit || b.nom || b.name }}</h4>
                <p class="muted">{{ b.description || 'Sans description' }}</p>
              </div>
              <span class="chip">{{ (b.prix || 0).toFixed ? b.prix.toFixed(2) : b.prix || '0.00' }} $</span>
            </div>
            <div class="qty-row">
              <button class="btn ghost" type="button" @click="dec(b.id)">-</button>
              <input type="number" min="0" :max="boxSize" v-model.number="quantites[b.id]" @input="clamp(b.id)" />
              <button class="btn primary" type="button" @click="inc(b.id)">+</button>
            </div>
          </div>
        </div>
      </div>

      <div class="panel">
        <h2>3. Vos informations</h2>
        <div class="two">
          <div class="field">
            <label>Nom complet</label>
            <input v-model="form.nom_client" required />
          </div>
          <div class="field">
            <label>Email</label>
            <input type="email" v-model="form.email_client" required />
          </div>
        </div>
        <div class="summary">
          <div><strong>Total biscuits</strong> <span>{{ totalSelected }} / {{ boxSize || '?' }}</span></div>
          <div><strong>Prix</strong> <span>{{ currentPrice }} $</span></div>
        </div>
        <div class="actions">
          <button class="btn primary" :disabled="sending" @click="submit">{{ sending ? 'Envoi...' : 'Passer la commande' }}</button>
          <p v-if="error" class="text-error">{{ error }}</p>
          <p v-if="success" class="text-success">{{ success }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import axios from 'axios';
import { useAuth } from '../composables/auth';

const { user } = useAuth();

const biscuits = ref([]);
const boxSize = ref(0);
const quantites = reactive({});
const sending = ref(false);
const error = ref('');
const success = ref('');
const form = reactive({ nom_client: '', email_client: '' });

const boxSizes = [
  { value: 4, label: 'Boite de 4', title: 'Degustation', desc: 'Parfait pour tester', price: 15 },
  { value: 6, label: 'Boite de 6', title: 'A partager', desc: 'Ideal pour deux', price: 20 },
  { value: 12, label: 'Boite de 12', title: 'Gourmande', desc: 'Pour la team', price: 35 },
];

const currentPrice = computed(() => {
  const found = boxSizes.find((b) => b.value === boxSize.value);
  return found ? found.price.toFixed(2) : '0.00';
});

const totalSelected = computed(() => Object.values(quantites).reduce((s, v) => s + (parseInt(v) || 0), 0));

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
  try {
    const resp = await axios.get('/api/biscuits');
    biscuits.value = resp.data || [];
    biscuits.value.forEach((b) => (quantites[b.id] = 0));
  } catch (e) {
    biscuits.value = [];
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
    taille_boite: boxSize.value,
    quantites: quantitesFiltrees,
    nom_client: form.nom_client,
    email_client: form.email_client,
  };
  sending.value = true;
  try {
    await axios.post('/commandes', payload);
    success.value = 'Commande envoyee. Merci !';
  } catch (e) {
    error.value = e.response?.data?.message || 'Echec de la commande.';
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
