import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AdminBiscuits() {
    const [biscuits, setBiscuits] = useState([]);
    const [saveurs, setSaveurs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [nomBiscuit, setNomBiscuit] = useState("");
    const [prix, setPrix] = useState("");
    const [description, setDescription] = useState("");
    const [saveurId, setSaveurId] = useState("");
    const [imageFile, setImageFile] = useState(null);

    useEffect(() => {
        fetchList();
    }, []);

    async function fetchList() {
        setLoading(true);
        setError(null);
        try {
            const resBiscuits = await axios.get("biscuits");
            console.log("API biscuits:", resBiscuits.data);

            let dataB = [];
            if (Array.isArray(resBiscuits.data)) {
                dataB = resBiscuits.data;
            } else if (Array.isArray(resBiscuits.data?.data)) {
                dataB = resBiscuits.data.data;
            } else if (
                resBiscuits.data?.data?.biscuits &&
                Array.isArray(resBiscuits.data.data.biscuits)
            ) {
                dataB = resBiscuits.data.data.biscuits;
            }
            setBiscuits(dataB);

            const resSaveurs = await axios.get("saveurs");
            console.log("API saveurs:", resSaveurs.data);

            let dataS = [];
            if (Array.isArray(resSaveurs.data)) {
                dataS = resSaveurs.data;
            } else if (Array.isArray(resSaveurs.data?.data)) {
                dataS = resSaveurs.data.data;
            } else if (
                resSaveurs.data?.data?.saveurs &&
                Array.isArray(resSaveurs.data.data.saveurs)
            ) {
                dataS = resSaveurs.data.data.saveurs;
            }
            setSaveurs(dataS);
        } catch (e) {
            console.error("Erreur fetchList:", e);
            setError(
                e.response?.data?.message ||
                    e.message ||
                    "Erreur lors du chargement des données"
            );
        } finally {
            setLoading(false);
        }
    }

    function handleFileChange(e) {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        } else {
            setImageFile(null);
        }
    }

    async function createBiscuit(e) {
        e.preventDefault();
        setError(null);

        if (!nomBiscuit || !prix || !saveurId) {
            setError("Nom, prix et saveur sont obligatoires.");
            return;
        }

        try {
            const formData = new FormData();
            // ⚠️ met le même nom que dans ton controller Laravel
            formData.append("nom_biscuit", nomBiscuit);
            formData.append("prix", prix);
            if (description) formData.append("description", description);
            formData.append("saveur_id", saveurId);
            if (imageFile) formData.append("image", imageFile);

            await axios.post("biscuits", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setNomBiscuit("");
            setPrix("");
            setDescription("");
            setSaveurId("");
            setImageFile(null);
            if (e.target && e.target.reset) e.target.reset();

            await fetchList();
        } catch (e) {
            console.error("Erreur createBiscuit:", e);
            setError(
                e.response?.data?.message ||
                    e.message ||
                    "Erreur lors de la création du biscuit"
            );
        }
    }

    async function deleteBiscuit(id) {
        if (!window.confirm("Confirmer la suppression de ce biscuit ?")) return;

        try {
            await axios.delete(`biscuits/${id}`);
            await fetchList();
        } catch (e) {
            console.error("Erreur deleteBiscuit:", e);
            alert(
                e.response?.data?.message ||
                    e.message ||
                    "Erreur lors de la suppression du biscuit"
            );
        }
    }

    if (loading) {
        return (
            <div className="card">
                <div className="card-body">Chargement…</div>
            </div>
        );
    }

    return (
        <div>
            <h2>Gestion des biscuits (React)</h2>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="card mb-4">
                <div className="card-body">
                    <h5 className="card-title">Créer un nouveau biscuit</h5>
                    <form onSubmit={createBiscuit}>
                        <div className="mb-3">
                            <label className="form-label">Nom du biscuit</label>
                            <input
                                type="text"
                                className="form-control"
                                value={nomBiscuit}
                                onChange={(e) => setNomBiscuit(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Prix ($)</label>
                            <input
                                type="number"
                                className="form-control"
                                value={prix}
                                onChange={(e) => setPrix(e.target.value)}
                                step="0.01"
                                min="0"
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">
                                Description (facultative)
                            </label>
                            <textarea
                                className="form-control"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Saveur</label>
                            <select
                                className="form-select"
                                value={saveurId}
                                onChange={(e) => setSaveurId(e.target.value)}
                                required
                            >
                                <option value="">
                                    -- Sélectionner une saveur --
                                </option>
                                {saveurs.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.nom_saveur ?? s.nom ?? s.name}
                                    </option>
                                ))}
                            </select>
                            {saveurs.length === 0 && (
                                <small className="text-muted">
                                    Aucune saveur trouvée - vérifie /api/saveurs
                                    ou les seeders.
                                </small>
                            )}
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Image</label>
                            <input
                                type="file"
                                className="form-control"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>

                        <button type="submit" className="btn btn-primary">
                            Créer le biscuit
                        </button>
                    </form>
                </div>
            </div>

            <h3>Liste des biscuits</h3>
            <div className="grid">
                {Array.isArray(biscuits) && biscuits.length ? (
                    biscuits.map((biscuit) => (
                        <div className="card" key={biscuit.id}>
                            <div className="card-body">
                                <h4>
                                    {biscuit.nom_biscuit ??
                                        biscuit.nom ??
                                        biscuit.name}
                                </h4>

                                {biscuit.image && (
                                    <img
                                        src={`/Contenu/img/${biscuit.image}`}
                                        alt={
                                            biscuit.nom_biscuit ??
                                            biscuit.nom ??
                                            "Biscuit"
                                        }
                                        style={{
                                            maxWidth: "100%",
                                            maxHeight: "150px",
                                            objectFit: "cover",
                                            marginBottom: "0.5rem",
                                        }}
                                    />
                                )}

                                <p>{biscuit.description}</p>
                                <p>
                                    <strong>Prix : </strong>
                                    {biscuit.prix} $
                                </p>

                                <button
                                    className="btn btn-danger"
                                    onClick={() => deleteBiscuit(biscuit.id)}
                                >
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="card">
                        <div className="card-body">
                            Aucun biscuit disponible (React).
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
