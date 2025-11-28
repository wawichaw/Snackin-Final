import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminBiscuits(){
    const [biscuits, setBiscuits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState('');

    useEffect(()=>{
        fetchList();
    },[]);

    function fetchList(){
        setLoading(true);
        axios.get('/biscuits')
            .then(r=> setBiscuits(r.data || []))
            .catch(()=> setBiscuits([]))
            .finally(()=> setLoading(false));
    }

    function create(){
        if(!title) return;
        axios.post('/biscuits', { nom: title, description: '' })
            .then(()=> { setTitle(''); fetchList(); })
            .catch(e=> alert('Erreur: ' + (e.response?.data?.message || e.message)));
    }

    function remove(id){
        if(!confirm('Supprimer ce biscuit ?')) return;
        axios.delete(`/biscuits/${id}`)
            .then(()=> fetchList())
            .catch(e=> alert('Erreur: ' + (e.response?.data?.message || e.message)));
    }

    if(loading) return <div className="card"><div className="card-body">Chargement...</div></div>;

    return (
        <div>
            <h2>Gestion des biscuits</h2>
            <div className="mb-3">
                <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Nom nouveau biscuit" className="form-control" />
                <button className="btn primary mt-2" onClick={create}>Créer</button>
            </div>

            <div className="grid">
                {biscuits.map(b => (
                    <div className="card" key={b.id}>
                        <div className="card-body">
                            <h4>{b.nom ?? b.name}</h4>
                            <p>{b.description}</p>
                            <div>
                                <button className="btn btn-sm btn-danger" onClick={()=>remove(b.id)}>Supprimer</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
