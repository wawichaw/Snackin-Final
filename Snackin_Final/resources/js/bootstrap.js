import axios from 'axios';
window.axios = axios;

// Default axios configuration used by React components.
// API routes are under /api/* in this project, so set baseURL accordingly.
window.axios.defaults.baseURL = '/api';
// if token exists in localStorage apply it
const savedToken = localStorage.getItem('auth_token');
if (savedToken) {
	window.axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
}
// allow sending cookies for same-origin requests (Sanctum cookie-based auth)
window.axios.defaults.withCredentials = true;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
