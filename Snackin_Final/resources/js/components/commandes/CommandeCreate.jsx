import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function CommandeCreate(){
    const [form, setForm] = useState({ nom: '', adresse: '', biscuits: '' });
    const [message, setMessage] = useState(null);

    const { user } = useAuth();
    const navigate = useNavigate();

    function submit(e){
        e.preventDefault();
        // This endpoint requires auth in API; here we just show a placeholder or optionally submit to /commandes route
        if(!user){
            setMessage('Vous devez être connecté pour passer une commande.');
            navigate('/login');
            return;
        }

        axios.post('/commandes', form)
            .then(()=> setMessage('Commande envoyée (si endpoint accepte POST sans auth).'))
            .catch(err => setMessage('Impossible d\'envoyer la commande — vous devez être connecté.'));
    }

    return (
        <div className="card">
            <div className="card-body">
                <h2>Passer une commande</h2>
                {message && <div className="alert">{message}</div>}
                <form onSubmit={submit}>
                    <div className="mb-3">
                        <label>Nom</label>
                        <input value={form.nom} onChange={e=>setForm({...form, nom:e.target.value})} className="form-control" />
                    </div>
                    <div className="mb-3">
                        <label>Adresse</label>
                        <input value={form.adresse} onChange={e=>setForm({...form, adresse:e.target.value})} className="form-control" />
                    </div>
                    <div className="mb-3">
                        <label>Biscuits (id ou texte)</label>
                        <input value={form.biscuits} onChange={e=>setForm({...form, biscuits:e.target.value})} className="form-control" />
                    </div>
                    <button className="btn primary" type="submit">Envoyer</button>
                </form>
            </div>
        </div>
    );
}
