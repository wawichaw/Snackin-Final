import axios from 'axios';
window.axios = axios;

// Base API config (Laravel Sanctum / API routes)
window.axios.defaults.baseURL = '/api';
window.axios.defaults.withCredentials = true;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Auth token persisted in localStorage
const savedToken = localStorage.getItem('auth_token');
if (savedToken) {
    window.axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
}

// CSRF token from Blade meta (for POST non-API routes)
const tokenMeta = document.querySelector('meta[name="csrf-token"]');
if (tokenMeta) {
    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = tokenMeta.getAttribute('content');
}
