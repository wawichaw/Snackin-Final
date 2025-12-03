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
  background: linear-gradient(135deg, #fff1f7 0%, #ffe6ee 50%, #fff9f5 100%);
  min-height: calc(100vh - 80px);
  padding: 60px 0;
  position: relative;
  overflow: hidden;
  animation: fadeIn 0.6s ease-out;
}

.login-container::before {
  content: '';
  position: absolute;
  top: -30%;
  right: -20%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  animation: pulse 4s ease-in-out infinite;
}

.login-card {
  max-width: 520px;
  margin: 0 auto;
  padding: 48px;
  background: linear-gradient(180deg, #fff 0%, #fff8f9 100%);
  border-radius: 28px;
  box-shadow: 0 20px 60px rgba(236, 72, 153, 0.2);
  border: 2px solid #f7c6de;
  position: relative;
  z-index: 1;
  animation: fadeIn 0.8s ease-out 0.2s both;
  transition: all 0.3s ease;
}

.login-card:hover {
  box-shadow: 0 24px 72px rgba(236, 72, 153, 0.25);
  transform: translateY(-4px);
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
  padding: 14px 18px;
  border: 2px solid rgba(160, 22, 43, 0.15);
  border-radius: 12px;
  font-size: 16px;
  background: #fff;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: #1f0f15;
}

.form-input:focus {
  outline: none;
  border-color: #ec4899;
  box-shadow: 0 0 0 4px rgba(236, 72, 153, 0.15);
  transform: translateY(-1px);
  background: #fff;
}

.form-input::placeholder {
  color: rgba(31, 15, 21, 0.4);
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
  padding: 16px 48px;
  border: none;
  border-radius: 999px;
  font-size: 17px;
  font-weight: 700;
  box-shadow: 0 8px 24px rgba(236, 72, 153, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.btn-submit::before {
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

.btn-submit:hover::before {
  width: 300px;
  height: 300px;
}

.btn-submit:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 32px rgba(236, 72, 153, 0.5);
}

.btn-submit:active {
  transform: translateY(-1px);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
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
