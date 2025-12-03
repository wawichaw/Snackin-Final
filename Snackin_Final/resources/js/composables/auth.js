import { computed, reactive, watch } from 'vue';
import axios from 'axios';
import api from '../axios';

const initialUser = () => {
    try {
        const stored = localStorage.getItem('user_data');
        if (stored) return JSON.parse(stored);
    } catch (e) {}
    if (typeof window !== 'undefined' && window.user_auth_data) {
        return window.user_auth_data.user || null;
    }
    return null;
};

const state = reactive({
    user: initialUser(),
    token: localStorage.getItem('auth_token') || null,
});

watch(
    () => state.token,
    (token) => {
        if (token) {
            localStorage.setItem('auth_token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
        }
    },
    { immediate: true }
);

const setUser = (user) => {
    state.user = user;
    if (user) {
        localStorage.setItem('user_data', JSON.stringify(user));
    } else {
        localStorage.removeItem('user_data');
    }
};

const setToken = (token) => {
    state.token = token;
};

const login = async (email, password, recaptchaToken) => {
    if (!recaptchaToken || recaptchaToken === 'no-captcha') {
        // Si pas de reCAPTCHA configuré, on peut essayer sans
        if (recaptchaToken !== 'no-captcha') {
            throw new Error('Le reCAPTCHA est obligatoire.');
        }
    }
    await axios.get('/sanctum/csrf-cookie', { withCredentials: true });
    const payload = {
        email,
        password,
    };
    // Ne pas envoyer 'no-captcha' au backend, seulement un vrai token
    if (recaptchaToken && recaptchaToken !== 'no-captcha') {
        payload['g-recaptcha-response'] = recaptchaToken;
    }
    const resp = await api.post('/login', payload);
    const data = resp.data?.data ?? resp.data;
    if (!data || !data.token) throw new Error('Login failed');
    setToken(data.token);
    setUser(data.user);
    return data.user;
};

const register = async (name, email, password, password_confirmation, recaptchaToken) => {
    if (!recaptchaToken || recaptchaToken === 'no-captcha') {
        if (recaptchaToken !== 'no-captcha') {
            throw new Error('Le reCAPTCHA est obligatoire.');
        }
    }
    await axios.get('/sanctum/csrf-cookie', { withCredentials: true });
    const payload = {
        name,
        email,
        password,
        password_confirmation,
    };
    if (recaptchaToken && recaptchaToken !== 'no-captcha') {
        payload['g-recaptcha-response'] = recaptchaToken;
    }
    const resp = await api.post('/register', payload);
    const data = resp.data?.data ?? resp.data;
    if (!data || !data.token) throw new Error('Registration failed');
    setToken(data.token);
    setUser(data.user);
    return data.user;
};

const logout = async () => {
    try {
        await axios.post('/logout');
    } catch (e) {
        /* ignore */
    }
    setToken(null);
    setUser(null);
};

export function useAuth() {
    return {
        user: computed(() => state.user),
        token: computed(() => state.token),
        login,
        register,
        logout,
        setUser,
        setToken,
    };
}
