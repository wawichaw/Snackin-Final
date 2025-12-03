<template>
  <div class="register-container">
    <div class="register-card">
      <h2 class="register-title">✨ S'inscrire</h2>
      
      <div v-if="error" class="error-alert">
        <ul>
          <li>{{ error }}</li>
        </ul>
      </div>

      <form @submit.prevent="handleSubmit" class="register-form">
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
            v-model="c_password" 
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
import axios from 'axios';

const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';

// Variables réactives (équivalent à data() en Vue 2)
const name = ref('');
const email = ref('');
const password = ref('');
const c_password = ref(''); // c_password comme dans le document
const error = ref(null);
const loading = ref(false);
const recaptchaRef = ref(null);
const widgetId = ref(null);
const recaptchaToken = ref('');

const router = useRouter();
const route = useRoute();

const renderRecaptcha = () => {
  if (!SITE_KEY || SITE_KEY.trim() === '') {
    console.warn('reCAPTCHA non configuré: VITE_RECAPTCHA_SITE_KEY est vide ou non définie');
    recaptchaToken.value = 'no-captcha';
    return;
  }
  
  if (!window.grecaptcha || !recaptchaRef.value || widgetId.value !== null) return;
  
  try {
    widgetId.value = window.grecaptcha.render(recaptchaRef.value, {
      sitekey: SITE_KEY,
      callback: (token) => {
        recaptchaToken.value = token;
        error.value = null; // Effacer l'erreur si le captcha fonctionne
      },
      'error-callback': (errorCode) => {
        recaptchaToken.value = '';
        console.error('reCAPTCHA error:', errorCode);
        // Messages d'erreur plus informatifs
        if (errorCode === 'invalid-site-key' || !errorCode) {
          // "Invalid site key" est souvent retourné sans code d'erreur
          const keyStatus = SITE_KEY ? 'Définie mais invalide' : 'Non définie';
          console.warn('reCAPTCHA Site Key:', keyStatus);
          console.warn('Valeur de la clé:', SITE_KEY ? `${SITE_KEY.substring(0, 10)}...` : 'Non définie');
          error.value = 'Clé reCAPTCHA invalide. Vérifiez que :\n' +
            '1. La clé dans .env (VITE_RECAPTCHA_SITE_KEY) est correcte\n' +
            '2. Le domaine (localhost, 127.0.0.1) est autorisé dans Google reCAPTCHA\n' +
            '3. Vous avez redémarré le serveur Vite après modification de .env\n\n' +
            'Pour désactiver reCAPTCHA en développement, supprimez VITE_RECAPTCHA_SITE_KEY de .env';
        } else if (errorCode === 'network-error') {
          error.value = 'Erreur réseau avec reCAPTCHA. Vérifiez votre connexion internet.';
        } else {
          error.value = `Erreur reCAPTCHA (code: ${errorCode || 'inconnu'}). Vérifiez que votre domaine est autorisé dans la configuration Google reCAPTCHA.`;
        }
        // Permettre de continuer sans reCAPTCHA si erreur (pour le développement)
        recaptchaToken.value = 'no-captcha';
      },
      'expired-callback': () => {
        recaptchaToken.value = '';
        console.warn('reCAPTCHA token expired');
      },
    });
  } catch (e) {
    console.error('Failed to render reCAPTCHA:', e);
    error.value = 'Impossible de charger reCAPTCHA. Vérifiez votre configuration ou votre connexion.';
    recaptchaToken.value = 'no-captcha'; // Permettre de continuer
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
  if (!SITE_KEY || SITE_KEY.trim() === '') {
    console.warn('reCAPTCHA non configuré: VITE_RECAPTCHA_SITE_KEY est vide ou non définie');
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

// Méthode handleSubmit conforme au document
const handleSubmit = async () => {
  error.value = null;
  loading.value = true;
  
  try {
    // a. Vérification du captcha : bloquer l'envoi sans validation reCAPTCHA (comme dans le document)
    // Mais permettre 'no-captcha' si reCAPTCHA a échoué (pour le développement)
    if (SITE_KEY && !recaptchaToken.value) {
      error.value = 'Veuillez cocher "Je ne suis pas un robot"';
      loading.value = false;
      return;
    }
    // Si reCAPTCHA a échoué mais qu'on a 'no-captcha', on peut continuer (pour le développement)
    if (SITE_KEY && recaptchaToken.value === 'no-captcha') {
      console.warn('reCAPTCHA non disponible, tentative d\'inscription sans');
    }
    
    // b. Vérification du cookie CSRF qui protège les requêtes POST (obligatoire pour Sanctum)
    await axios.get('/sanctum/csrf-cookie', { withCredentials: true });
    
    // c. Envoi du formulaire
    const payload = {
      name: name.value,
      email: email.value,
      password: password.value,
      c_password: c_password.value, // Utiliser c_password comme dans le document
      password_confirmation: c_password.value, // Laravel attend aussi password_confirmation
    };
    
    // Ajouter reCAPTCHA si disponible
    if (SITE_KEY && recaptchaToken.value && recaptchaToken.value !== 'no-captcha') {
      payload['g-recaptcha-response'] = recaptchaToken.value;
    }
    
    const res = await axios.post('/api/register', payload, { withCredentials: true });
    
    // d. Si l'API renvoie success, l'utilisateur sera redirigé vers /login
    if (res.data && (res.data.success || res.data.data)) {
      resetRecaptcha(); // e. Réinitialisation du captcha
      router.push('/login');
    } else {
      error.value = "Erreur lors de l'inscription";
      resetRecaptcha(); // e. Réinitialisation du captcha si erreur
    }
  } catch (err) {
    // Gestion des erreurs
    if (err.response && err.response.status === 422) {
      // Erreurs de validation Laravel
      error.value = Object.values(err.response.data.errors || {}).flat().join(' ');
    } else {
      error.value = err.response?.data?.message || "Erreur lors de l'inscription";
    }
    resetRecaptcha(); // e. Réinitialisation du captcha : L'utilisateur doit re-valider le captcha si erreur
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.register-container {
  background: linear-gradient(135deg, #fff1f7 0%, #ffe6ee 50%, #fff9f5 100%);
  min-height: calc(100vh - 80px);
  padding: 60px 0;
  position: relative;
  overflow: hidden;
  animation: fadeIn 0.6s ease-out;
}

.register-container::before {
  content: '';
  position: absolute;
  top: -30%;
  left: -20%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  animation: pulse 4s ease-in-out infinite;
}

.register-card {
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

.register-card:hover {
  box-shadow: 0 24px 72px rgba(236, 72, 153, 0.25);
  transform: translateY(-4px);
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
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(236, 72, 153, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: 100%;
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

.btn-submit:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 12px 32px rgba(236, 72, 153, 0.5);
}

.btn-submit:active:not(:disabled) {
  transform: translateY(-1px);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
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
