import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminSaveurs(){
    const [saveurs, setSaveurs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState('');

    useEffect(()=>{ fetchList(); },[]);

    function fetchList(){
        setLoading(true);
        axios.get('/saveurs')
            .then(r=> setSaveurs(r.data || []))
            .catch(()=> setSaveurs([]))
            .finally(()=> setLoading(false));
    }

    function create(){
        if(!name) return;
        axios.post('/saveurs', { nom: name, description: '' })
            .then(()=> { setName(''); fetchList(); })
            .catch(e=> alert('Erreur: ' + (e.response?.data?.message || e.message)));
    }

    function remove(id){
        if(!confirm('Supprimer cette saveur ?')) return;
        axios.delete(`/saveurs/${id}`)
            .then(()=> fetchList())
            .catch(e=> alert('Erreur: ' + (e.response?.data?.message || e.message)));
    }

    if(loading) return <div className="card"><div className="card-body">Chargement…</div></div>;

    return (
        <div>
            <h2>Gestion des saveurs</h2>
            <div className="mb-3">
                <input value={name} onChange={e=>setName(e.target.value)} placeholder="Nom nouvelle saveur" className="form-control" />
                <button className="btn primary mt-2" onClick={create}>Créer</button>
            </div>

            <div className="grid">
                {saveurs.map(s => (
                    <div className="card" key={s.id}>
                        <div className="card-body">
                            <h4>{s.nom ?? s.name}</h4>
                            <p>{s.description}</p>
                            <div>
                                <button className="btn btn-sm btn-danger" onClick={()=>remove(s.id)}>Supprimer</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
