<template>
  <div class="add-article-page">
    <div class="article-card">
      <h2 class="article-title">📝 Ajouter un article</h2>
      
      <div v-if="error" class="error-alert">
        <p>{{ error }}</p>
      </div>

      <form @submit.prevent="addArticle" enctype="multipart/form-data">
        <div class="form-group">
          <label for="titre">Titre</label>
          <input 
            id="titre" 
            type="text" 
            v-model="article.titre" 
            required 
            class="form-input"
            placeholder="Entrez le titre de l'article"
          />
        </div>

        <div class="form-group">
          <label for="contenu">Contenu</label>
          <textarea 
            id="contenu" 
            v-model="article.contenu" 
            required 
            class="form-textarea"
            rows="6"
            placeholder="Entrez le contenu de l'article"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="photo">Image</label>
          <input 
            id="photo" 
            type="file" 
            @change="onFileChange" 
            accept="image/*"
            class="form-input"
          />
          <small class="form-hint">Formats acceptés : JPG, PNG, GIF (max 2 Mo)</small>
          <div v-if="article.photo" class="preview-image">
            <p>Aperçu :</p>
            <img :src="previewUrl" alt="Aperçu" />
          </div>
        </div>

        <div class="form-actions">
          <button 
            type="submit" 
            class="btn-submit" 
            :disabled="loading"
          >
            {{ loading ? 'Envoi en cours...' : '✨ Publier l\'article' }}
          </button>
          <RouterLink to="/" class="btn-cancel">Annuler</RouterLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { RouterLink } from 'vue-router';
import api from '../axios';

const router = useRouter();

const article = reactive({
  titre: '',
  contenu: '',
  photo: null,
});

const error = ref('');
const loading = ref(false);
const previewUrl = ref('');

// Fonction pour gérer le changement de fichier
const onFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    article.photo = file;
    // Créer une URL d'aperçu
    const reader = new FileReader();
    reader.onload = (event) => {
      previewUrl.value = event.target.result;
    };
    reader.readAsDataURL(file);
  } else {
    article.photo = null;
    previewUrl.value = '';
  }
};

// Fonction pour ajouter l'article
const addArticle = async () => {
  error.value = '';
  loading.value = true;

  try {
    // Vérifier si l'utilisateur est connecté
    const token = localStorage.getItem('auth_token');
    if (!token) {
      error.value = 'Vous devez être connecté pour ajouter un article.';
      router.push('/login');
      return;
    }

    // Préparer FormData pour l'envoi
    const formData = new FormData();
    formData.append('titre', article.titre);
    formData.append('contenu', article.contenu);
    if (article.photo) {
      formData.append('photo', article.photo);
    }

    // Envoyer la requête API avec le token
    const response = await api.post('/articles', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`,
      },
    });

    // Si succès, afficher message et rediriger
    if (response.data && (response.data.success || response.data.data)) {
      // Réinitialiser le formulaire
      article.titre = '';
      article.contenu = '';
      article.photo = null;
      previewUrl.value = '';
      // Rediriger vers la page d'accueil après succès
      setTimeout(() => {
        router.push('/');
      }, 1500);
    }
  } catch (e) {
    console.error('Erreur lors de l\'ajout de l\'article:', e);
    if (e.response?.status === 401) {
      error.value = 'Vous devez être connecté pour ajouter un article.';
      router.push('/login');
    } else if (e.response?.data?.errors) {
      const errors = e.response.data.errors;
      error.value = Object.values(errors).flat().join(', ');
    } else {
      error.value = e.response?.data?.message || 'Erreur lors de l\'ajout de l\'article.';
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.add-article-page {
  min-height: calc(100vh - 80px);
  padding: 40px 20px;
  background: linear-gradient(180deg, #fff1f7 0%, #ffe6ee 100%);
}

.article-card {
  max-width: 700px;
  margin: 0 auto;
  background: #fff;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 10px 30px rgba(236, 72, 153, 0.15);
  border: 1px solid rgba(236, 72, 153, 0.1);
}

.article-title {
  font-size: 28px;
  font-weight: 800;
  color: #2a1620;
  margin-bottom: 24px;
  text-align: center;
}

.error-alert {
  background: #fee2e2;
  border: 1px solid #fecaca;
  color: #991b1b;
  padding: 12px 16px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.error-alert p {
  margin: 0;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #2a1620;
  margin-bottom: 8px;
  font-size: 14px;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid rgba(236, 72, 153, 0.2);
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.2s ease;
  font-family: inherit;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #ec4899;
  box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

.form-hint {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: #694256;
}

.preview-image {
  margin-top: 16px;
  padding: 16px;
  background: #fff8f9;
  border-radius: 12px;
  border: 1px solid rgba(236, 72, 153, 0.1);
}

.preview-image p {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #2a1620;
}

.preview-image img {
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
  object-fit: cover;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 32px;
  justify-content: center;
}

.btn-submit {
  padding: 12px 24px;
  background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
  color: #fff;
  border: none;
  border-radius: 999px;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(236, 72, 153, 0.3);
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(236, 72, 153, 0.4);
}

.btn-submit:active:not(:disabled) {
  transform: translateY(0);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-cancel {
  padding: 12px 24px;
  background: #fff;
  color: #2a1620;
  border: 1px solid rgba(236, 72, 153, 0.2);
  border-radius: 999px;
  font-weight: 600;
  font-size: 16px;
  text-decoration: none;
  transition: all 0.2s ease;
  display: inline-block;
}

.btn-cancel:hover {
  background: #fff8f9;
  border-color: #ec4899;
  transform: translateY(-2px);
}
</style>

