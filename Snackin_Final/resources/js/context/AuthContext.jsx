import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }){
    // try restore user from localStorage or server-injected window.user_auth_data
    const initialUser = (() => {
        try {
            const stored = localStorage.getItem('user_data');
            if (stored) return JSON.parse(stored);
        } catch (e) {}
        // if backend rendered the page and injected user payload
        if (typeof window !== 'undefined' && window.user_auth_data) {
            return window.user_auth_data.user ? window.user_auth_data.user : null;
        }
        return null;
    })();

    const [user, setUser] = useState(initialUser);
    const [token, setToken] = useState(() => localStorage.getItem('auth_token'));

    useEffect(()=>{
        // if token exists, configure axios header (bearer)
        if(token){
            localStorage.setItem('auth_token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            // optionally fetch user from token; the API returns user when authenticating, but we try
            // either rely on stored user or leave as null until login/register
            // try to restore stored user
            const stored = localStorage.getItem('user_data');
            if(stored){
                try{ setUser(JSON.parse(stored)); }catch(e){ setUser(null); }
            }
            // If server injected user (session-based auth), keep that as well
            if(!stored && typeof window !== 'undefined' && window.user_auth_data && window.user_auth_data.user){
                setUser(window.user_auth_data.user);
            }
        } else {
            delete axios.defaults.headers.common['Authorization'];
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
        }
    }, [token]);

    const login = async (email, password) => {
        // Utilise l'API Sanctum (baseURL déjà /api dans bootstrap)
        const resp = await axios.post('/login', { email, password });
        const data = resp.data?.data ?? resp.data;
        if(!data || !data.token) throw new Error('Login failed');
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('user_data', JSON.stringify(data.user));
        return data.user;
    };

    const register = async (name, email, password, password_confirmation) => {
        const resp = await axios.post('/register', { name, email, password, password_confirmation });
        const data = resp.data?.data ?? resp.data;
        if(!data || !data.token) throw new Error('Registration failed');
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('user_data', JSON.stringify(data.user));
        return data.user;
    };

    const logout = async () => {
        // Révoque le token côté API pour éviter les 401 ultérieurs
        try { await axios.post('/logout'); } catch(e) {/* ignore errors */}
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{user, token, login, register, logout}}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(){
    return useContext(AuthContext);
}
