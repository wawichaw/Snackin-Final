import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function SaveursIndex(){
    const [saveurs, setSaveurs] = useState([]);

    useEffect(()=>{
        let mounted = true;
        axios.get('/api/saveurs')
            .then(r => { if(mounted) setSaveurs(r.data || []); })
            .catch(e => console.error(e));
        return ()=> mounted = false;
    },[]);

    return (
        <div>
            <h2>Saveurs</h2>
            <div className="grid">
                {saveurs.length ? saveurs.map(s => (
                    <div key={s.id} className="card">
                        <div className="card-body">
                            <h4>{s.nom ?? s.name}</h4>
                            <p>{s.description ?? ''}</p>
                        </div>
                    </div>
                )) : <div className="card"><div className="card-body">Aucune saveur</div></div>}
            </div>
        </div>
    );
}
