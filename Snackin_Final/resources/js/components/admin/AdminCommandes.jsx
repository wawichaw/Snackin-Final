import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AdminCommandes() {
    const [commandes, setCommandes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCommandes();
    }, []);

    function fetchCommandes() {
        setLoading(true);
        // Récupérer le token depuis localStorage
        const token = localStorage.getItem("auth_token");

        // Configurer les headers avec le token d'authentification
        const config = {
            headers: {},
            withCredentials: true,
        };

        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        config.headers["X-Requested-With"] = "XMLHttpRequest";

        // Utiliser l'URL API (baseURL = /api est déjà configurée dans bootstrap)
        axios
            .get("commandes", config)
            .then((r) => setCommandes(r.data?.data || r.data || []))
            .catch((e) => {
                console.error("fetch commandes", e);
                if (e.response?.status === 401) {
                    console.error("Non authentifié. Vérifiez votre token.");
                }
                setCommandes([]);
            })
            .finally(() => setLoading(false));
    }

    if (loading)
        return (
            <div className="card">
                <div className="card-body">Chargement des commandes…</div>
            </div>
        );

    return (
        <div>
            <h2>Commandes (admin)</h2>
            <div className="grid">
                {commandes.length ? (
                    commandes.map((c) => (
                        <div className="card" key={c.id}>
                            <div className="card-body">
                                <div>
                                    <strong>Commande #{c.id}</strong>
                                </div>
                                <div>
                                    Utilisateur:{" "}
                                    {c.utilisateur_id ?? c.user_id ?? "—"}
                                </div>
                                <div>
                                    Date: {c.date_commande ?? c.created_at}
                                </div>
                                <div>
                                    Quantité: {c.quantite ?? c.total ?? "—"}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="card">
                        <div className="card-body">Aucune commande</div>
                    </div>
                )}
            </div>
        </div>
    );
}
