import React, { useEffect, useRef, useState } from "react";
import api from "../axios";

export default function SearchBar({ onResults }) {
    const [term, setTerm] = useState("");
    const [results, setResults] = useState([]);

    useEffect(() => {
        if (!term) {
            setResults([]);
            return;
        }

        const timeout = setTimeout(async () => {
            try {
                const resp = await api.get("/biscuits/autocomplete", {
                    params: { term },
                });
                setResults(resp.data || []);
            } catch (e) {
                console.error("Erreur autocomlétion :", e);
                setResults([]);
            }
        }, 300);

        return () => clearTimeout(timeout);
    }, [term]);

    const handleSelect = (item) => {
        console.log("Sélection autocomplétion :", item);
    };

    return (
        <div className="position-relative me-3" style={{ minWidth: 250 }}>
            <input
                type="text"
                className="form-control"
                placeholder="Rechercher un biscuit..."
                value={term}
                onChange={(e) => setTerm(e.target.value)}
            />
            {results.length > 0 && (
                <ul
                    className="list-group position-absolute w-100"
                    style={{ zIndex: 1000, maxHeight: 200, overflowY: "auto" }}
                >
                    {results.map((item) => (
                        <li
                            key={item.id}
                            className="list-group-item list-group-item-action"
                            onClick={() => handleSelect(item)}
                        >
                            {item.titre || item.name || item.nom}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
