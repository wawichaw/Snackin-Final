<template>
  <div class="register-container">
    <div class="register-card">
      <h2 class="register-title">✨ S'inscrire</h2>
      
      <div v-if="error" class="error-alert">
        <ul>
          <li>{{ error }}</li>
        </ul>
      </div>

      <form @submit.prevent="submit" class="register-form">
        <div class="form-group">
          <label for="name">Nom</label>
          <input 
            id="name" 
            type="text" 
            v-model="name" 
            required 
            autofocus 
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input 
            id="email" 
            type="email" 
            v-model="email" 
            required 
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
          <label for="password-confirm">Confirmer le mot de passe</label>
          <input 
            id="password-confirm" 
            type="password" 
            v-model="passwordConfirmation" 
            required 
            class="form-input"
          />
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
            {{ loading ? 'Inscription en cours...' : "✨ S'inscrire" }}
          </button>
          
          <div class="form-links">
            <RouterLink to="/login" class="form-link">
              Déjà un compte ? Se connecter
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

const name = ref('');
const email = ref('');
const password = ref('');
const passwordConfirmation = ref('');
const error = ref('');
const loading = ref(false);
const recaptchaRef = ref(null);
const widgetId = ref(null);
const recaptchaToken = ref('');

const { register } = useAuth();
const router = useRouter();
const route = useRoute();

const renderRecaptcha = () => {
  if (!SITE_KEY) {
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
      renderRecaptcha();
    }
  } else {
    checkTimeout = setTimeout(checkRecaptchaLoaded, 100);
  }
};

onMounted(() => {
  if (!SITE_KEY) {
    recaptchaToken.value = 'no-captcha';
    return;
  }
  
  attempts = 0;
  
  if (window.grecaptcha) {
    checkRecaptchaLoaded();
  } else {
    checkInterval = setInterval(() => {
      if (window.grecaptcha) {
        clearInterval(checkInterval);
        checkInterval = null;
        checkRecaptchaLoaded();
      }
    }, 100);
    
    setTimeout(() => {
      if (checkInterval) {
        clearInterval(checkInterval);
        checkInterval = null;
      }
      if (!widgetId.value) {
        console.warn('reCAPTCHA failed to load, allowing registration without it');
        recaptchaToken.value = 'no-captcha';
      }
    }, 5000);
  }
});

onBeforeUnmount(() => {
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
    await register(name.value, email.value, password.value, passwordConfirmation.value, recaptchaToken.value);
    resetRecaptcha();
    const redirect = route.query.redirect || '/';
    router.push(redirect);
  } catch (e) {
    error.value = e.response?.data?.message || e.response?.data?.errors || e.message || "Erreur a l'inscription.";
    resetRecaptcha();
  } finally {
    loading.value = false;
  }
  };
</script>

<style scoped>
.register-container {
  background: linear-gradient(135deg, #fff1f7 0%, #ffe6ee 100%);
  min-height: calc(100vh - 80px);
  padding: 40px 0;
}

.register-card {
  max-width: 500px;
  margin: 0 auto;
  padding: 40px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(236, 72, 153, 0.15);
  border: 2px solid #f7c6de;
}

.register-title {
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
  margin-top: 20px;
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
