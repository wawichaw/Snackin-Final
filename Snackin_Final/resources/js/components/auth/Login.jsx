import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const recaptchaRef = useRef(null);
    const widgetIdRef = useRef(null);
    const [recaptchaToken, setRecaptchaToken] = useState(false);

    // rendu et gestion reCAPTCHA

    useEffect(() => {
        let interval = null;

        function renderRecaptcha() {
            if (!window.grecaptcha || !recaptchaRef.current) return;
            if (widgetIdRef.current !== null) return;

            const id = window.grecaptcha.render(recaptchaRef.current, {
                sitekey: SITE_KEY,
                callback: (token) => setRecaptchaToken(token),
                "error-callback": () => setRecaptchaToken(""),
                "expired-callback": () => setRecaptchaToken(""),
            });

            widgetIdRef.current = id;
            clearInterval(interval);
        }

        interval = setInterval(renderRecaptcha, 500);

        return () => {
            if (window.grecaptcha && widgetIdRef.current !== null) {
                window.grecaptcha.reset(widgetIdRef.current);
            }
            widgetIdRef.current = null;
            clearInterval(interval);
        };
    }, []);

    const resetRecaptcha = () => {
        if (window.grecaptcha && widgetIdRef.current !== null) {
            window.grecaptcha.reset(widgetIdRef.current);
            setRecaptchaToken("");
        }
    };

    async function submit(e) {
        e.preventDefault();
        setError(null);

        if (!recaptchaToken) {
            setError('Veuillez cocher "Je ne suis pas un robot".');
            return;
        }

        setLoading(true);

        try {
            await login(email, password, recaptchaToken);
            resetRecaptcha();
            navigate("/");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    err.response?.data?.errors ||
                    err.message ||
                    "Une erreur est survenue lors de la connexion."
            );
            resetRecaptcha();
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="card">
            <div className="card-body">
                <h2>Se connecter</h2>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={submit}>
                    <div className="mb-3">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="form-control"
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label>Mot de passe</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="form-control"
                            required
                        />
                    </div>
                    {/* reCAPTCHA  */}
                    <div className="mb-3">
                        <div ref={recaptchaRef}></div>
                    </div>
                    <button className="btn primary" disabled={loading}>
                        {loading ? "Connexion..." : "Se connecter"}
                    </button>{" "}
                </form>
            </div>
        </div>
    );
}
