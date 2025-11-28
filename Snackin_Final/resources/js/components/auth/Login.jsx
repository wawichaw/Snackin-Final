import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login(){
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    async function submit(e){
        e.preventDefault();
        setError(null);
        try{
            await login(email, password);
            navigate('/');
        }catch(err){
            setError(err.response?.data?.message || err.message || 'Erreur de connexion');
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
                        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="form-control" required />
                    </div>
                    <div className="mb-3">
                        <label>Mot de passe</label>
                        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="form-control" required />
                    </div>
                    <button className="btn primary">Se connecter</button>
                </form>
            </div>
        </div>
    );
}
