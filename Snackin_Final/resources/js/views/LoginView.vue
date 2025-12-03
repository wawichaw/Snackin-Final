<template>
  <div class="login-container">
    <div class="login-card">
      <h2 class="login-title">🔐 Se connecter</h2>
      
      <div v-if="error" class="error-alert">
        <ul>
          <li>{{ error }}</li>
        </ul>
      </div>

      <form @submit.prevent="submit" class="login-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            id="email" 
            type="email" 
            v-model="email" 
            required 
            autofocus 
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="password">Mot de passe</label>
          <input 
            id="password" 
            type="password" 
            v-model="password" 
            required 
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label class="remember-label">
            <input type="checkbox" v-model="remember" class="remember-checkbox" />
            Se souvenir de moi
          </label>
        </div>

        <div v-if="SITE_KEY" class="form-group">
          <div ref="recaptchaRef" class="recaptcha-container"></div>
          <p v-if="!recaptchaToken && SITE_KEY" class="recaptcha-hint">Veuillez cocher "Je ne suis pas un robot" ci-dessus</p>
        </div>

        <div class="form-actions">
          <button 
            type="submit" 
            class="btn-submit" 
            :disabled="loading"
          >
            {{ loading ? 'Connexion...' : '✨ Se connecter' }}
          </button>
          
          <div class="form-links">
            <RouterLink to="/register" class="form-link">
              Pas encore de compte ? S'inscrire
            </RouterLink>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter, useRoute, RouterLink } from 'vue-router';
import { useAuth } from '../composables/auth';

const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';

const email = ref('');
const password = ref('');
const remember = ref(false);
const error = ref('');
const loading = ref(false);
const recaptchaRef = ref(null);
const widgetId = ref(null);
const recaptchaToken = ref('');

const router = useRouter();
const route = useRoute();
const { login } = useAuth();

const renderRecaptcha = () => {
  if (!SITE_KEY) {
    // Pas de clé reCAPTCHA, on peut se connecter sans
    recaptchaToken.value = 'no-captcha';
    return;
  }
  
  if (!window.grecaptcha || !recaptchaRef.value || widgetId.value !== null) return;
  
  try {
    widgetId.value = window.grecaptcha.render(recaptchaRef.value, {
      sitekey: SITE_KEY,
      callback: (token) => {
        recaptchaToken.value = token;
      },
      'error-callback': () => {
        recaptchaToken.value = '';
        console.error('reCAPTCHA error');
      },
      'expired-callback': () => {
        recaptchaToken.value = '';
      },
    });
  } catch (e) {
    console.error('Failed to render reCAPTCHA:', e);
  }
};

let checkInterval = null;
let checkTimeout = null;
let attempts = 0;
const MAX_ATTEMPTS = 50; // 5 secondes max (50 * 100ms)

const checkRecaptchaLoaded = () => {
  attempts++;
  
  if (attempts > MAX_ATTEMPTS) {
    console.warn('reCAPTCHA failed to load after max attempts');
    recaptchaToken.value = 'no-captcha';
    return;
  }
  
  if (window.grecaptcha) {
    if (window.grecaptcha.ready) {
      window.grecaptcha.ready(() => {
        renderRecaptcha();
      });
    } else {
      // grecaptcha existe mais ready n'est pas disponible, essayer de rendre directement
      renderRecaptcha();
    }
  } else {
    // Réessayer après 100ms
    checkTimeout = setTimeout(checkRecaptchaLoaded, 100);
  }
};

onMounted(() => {
  if (!SITE_KEY) {
    recaptchaToken.value = 'no-captcha';
    return;
  }
  
  // Réinitialiser les tentatives
  attempts = 0;
  
  // Vérifier si reCAPTCHA est déjà chargé
  if (window.grecaptcha) {
    checkRecaptchaLoaded();
  } else {
    // Attendre le chargement du script avec un intervalle limité
    checkInterval = setInterval(() => {
      if (window.grecaptcha) {
        clearInterval(checkInterval);
        checkInterval = null;
        checkRecaptchaLoaded();
      }
    }, 100);
    
    // Timeout de sécurité après 5 secondes
    setTimeout(() => {
      if (checkInterval) {
        clearInterval(checkInterval);
        checkInterval = null;
      }
      if (!widgetId.value) {
        console.warn('reCAPTCHA failed to load, allowing login without it');
        recaptchaToken.value = 'no-captcha';
      }
    }, 5000);
  }
});

onBeforeUnmount(() => {
  // Nettoyer tous les intervalles et timeouts
  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = null;
  }
  if (checkTimeout) {
    clearTimeout(checkTimeout);
    checkTimeout = null;
  }
  
  if (window.grecaptcha && widgetId.value !== null) {
    try {
      window.grecaptcha.reset(widgetId.value);
    } catch (e) {
      console.error('Failed to reset reCAPTCHA:', e);
    }
  }
  
  attempts = 0;
});

const resetRecaptcha = () => {
  if (window.grecaptcha && widgetId.value !== null) {
    window.grecaptcha.reset(widgetId.value);
    recaptchaToken.value = '';
  }
};

const submit = async () => {
  error.value = '';
  if (SITE_KEY && !recaptchaToken.value) {
    error.value = 'Veuillez cocher "Je ne suis pas un robot".';
    return;
  }
  loading.value = true;
  try {
    await login(email.value, password.value, recaptchaToken.value);
    resetRecaptcha();
    const redirect = route.query.redirect || '/';
    router.push(redirect);
  } catch (e) {
    error.value = e.response?.data?.message || e.response?.data?.errors || e.message || 'Erreur de connexion.';
    resetRecaptcha();
  } finally {
    loading.value = false;
  }
  };
</script>

<style scoped>
.login-container {
  background: linear-gradient(135deg, #fff1f7 0%, #ffe6ee 100%);
  min-height: calc(100vh - 80px);
  padding: 40px 0;
}

.login-card {
  max-width: 500px;
  margin: 0 auto;
  padding: 40px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(236, 72, 153, 0.15);
  border: 2px solid #f7c6de;
}

.login-title {
  text-align: center;
  margin-bottom: 30px;
  color: #2a1620;
  font-size: 28px;
  font-weight: 800;
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

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #2a1620;
}

.form-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
}

.form-input:focus {
  outline: none;
  border-color: #ec4899;
  box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
}

.remember-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: normal;
}

.remember-checkbox {
  margin-right: 8px;
  accent-color: #ec4899;
}

.recaptcha-container {
  display: flex;
  justify-content: center;
  margin: 10px 0;
  min-height: 78px;
}

.recaptcha-hint {
  text-align: center;
  font-size: 12px;
  color: #666;
  margin-top: 5px;
}

.form-actions {
  text-align: center;
}

.btn-submit {
  background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
  color: white;
  padding: 15px 40px;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(236, 72, 153, 0.3);
  transition: all 0.3s ease;
  width: 100%;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(236, 72, 153, 0.4);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-links {
  margin-top: 15px;
}

.form-link {
  color: #9b182b;
  text-decoration: none;
  font-size: 14px;
}

.form-link:hover {
  text-decoration: underline;
}
</style>
