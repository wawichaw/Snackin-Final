import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function BiscuitsIndex(){
    const [biscuits, setBiscuits] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(()=>{
        let mounted = true;
        axios.get('/api/biscuits')
            .then(r => { if(mounted){ setBiscuits(r.data || []); } })
            .catch(e => console.error('Failed to fetch biscuits', e))
            .finally(()=> setLoading(false));
        return ()=> mounted=false;
    },[]);

    if(loading) return <div className="card"><div className="card-body">Chargement des biscuits…</div></div>;

    return (
        <div>
            <h2 className="mb-3">Nos biscuits</h2>
            <div className="grid">
                {biscuits.length ? biscuits.map(b => (
                    <div key={b.id} className="card">
                        <div className="card-body">
                            <h4>{b.nom ?? b.name}</h4>
                            <p>{b.description ?? ''}</p>
                            <a className="btn" href={`#/biscuits/${b.id}`}>Voir</a>
                        </div>
                    </div>
                )) : (
                    <div className="card"><div className="card-body">Aucun biscuit trouvé</div></div>
                )}
            </div>
        </div>
    );
}
