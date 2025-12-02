import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    // try restore user from localStorage or server-injected window.user_auth_data
    const initialUser = (() => {
        try {
            const stored = localStorage.getItem("user_data");
            if (stored) return JSON.parse(stored);
        } catch (e) {}

        // if backend rendered the page and injected user payload
        if (typeof window !== "undefined" && window.user_auth_data) {
            return window.user_auth_data.user ?? null;
        }
        return null;
    })();

    const [user, setUser] = useState(initialUser);
    const [token, setToken] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("auth_token");
        }
        return null;
    });

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            localStorage.setItem("auth_token", token);
        } else {
            delete axios.defaults.headers.common["Authorization"];
            localStorage.removeItem("auth_token");
            localStorage.removeItem("user_data");
        }
    }, [token]);

    //s'assure que le cookie csrf sanctum est présent
    const ensureCsrfCookie = async () => {
        await axios.get("/sanctum/csrf-cookie", { baseURL: "/" });
    };

    // connexion via api
    const login = async (email, password) => {
        await ensureCsrfCookie();
        // Utilise l'API Sanctum (baseURL déjà /api dans bootstrap)
        const resp = await axios.post("login", { email, password });
        const data = resp.data?.data ?? resp.data;
        if (!data || !data.token) throw new Error("Login failed");
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem("user_data", JSON.stringify(data.user));
        return data.user;
    };

    // inscription via api
    const register = async (name, email, password, password_confirmation) => {
        await ensureCsrfCookie();
        const resp = await axios.post("register", {
            name,
            email,
            password,
            password_confirmation,
        });

        const data = resp.data?.data ?? resp.data;
        if (!data || !data.token) throw new Error("Registration failed");
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem("user_data", JSON.stringify(data.user));
        return data.user;
    };

    const logout = async () => {
        // Révoque le token côté API pour éviter les 401 ultérieurs
        try {
            await axios.post("logout");
        } catch (e) {
            /* ignore errors */
        }
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
