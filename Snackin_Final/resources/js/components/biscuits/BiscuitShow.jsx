import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

export default function BiscuitShow(){
    const { id } = useParams();
    const [biscuit, setBiscuit] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(()=>{
        let mounted = true;
        axios.get(`/api/biscuits/${id}`)
            .then(r => { if(mounted) setBiscuit(r.data); })
            .catch(e => console.error(e))
            .finally(()=> setLoading(false));
        return ()=> mounted=false;
    },[id]);

    if(loading) return <div className="card"><div className="card-body">Chargement…</div></div>;
    if(!biscuit) return <div className="card"><div className="card-body">Biscuit introuvable</div></div>;

    return (
        <div className="card">
            <div className="card-body">
                <h2>{biscuit.nom ?? biscuit.name}</h2>
                <p>{biscuit.description}</p>
                <div><strong>Prix:</strong> {biscuit.prix ? `${biscuit.prix} $` : '—'}</div>
                <a className="btn primary mt-3" href="#/commandes/create">Commander</a>
            </div>
        </div>
    );
}
