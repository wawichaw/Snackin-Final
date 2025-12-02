import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [error, setError] = useState(null);
    const { register } = useAuth();
    const navigate = useNavigate();

    async function submit(e) {
        e.preventDefault();
        setError(null);

        if (password !== passwordConfirmation) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }

        try {
            await register(name, email, password, passwordConfirmation);
            //rediretion vers login après l'inscription
            navigate("/login");
        } catch (err) {
            console.error(err);

            if (err.response?.data?.errors) {
                const firstKey = Object.keys(err.response.data.errors)[0];
                setError(err.response.data.errors[firstKey][0]);
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError(
                    "Une erreur est survenue lors de linscripiton. Veuillez réessayer."
                );
            }
        }
    }

    return (
        <div className="card">
            <div className="card-body">
                <h2>S'inscrire</h2>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={submit}>
                    <div className="mb-3">
                        <label>Nom</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="form-control"
                            required
                        />
                    </div>
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
                    <div className="mb-3">
                        <label>Confirmer le mot de passe</label>
                        <input
                            type="password"
                            value={passwordConfirmation}
                            onChange={(e) =>
                                setPasswordConfirmation(e.target.value)
                            }
                            className="form-control"
                            required
                        />
                    </div>

                    <button className="btn primary">S'inscrire</button>
                </form>
            </div>
        </div>
    );
}
