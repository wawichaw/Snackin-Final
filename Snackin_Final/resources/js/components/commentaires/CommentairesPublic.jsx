import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function CommentairesPublic(){
    const [comments, setComments] = useState([]);

    useEffect(()=>{
        let mounted = true;
        axios.get('/api/commentaires')
            .then(r => { if(mounted) setComments(r.data || []); })
            .catch(e => console.error(e));
        return ()=> mounted=false;
    },[]);

    return (
        <div>
            <h2>Commentaires</h2>
            <div className="grid">
                {comments.length ? comments.map(c => (
                    <div key={c.id} className="card">
                        <div className="card-body">
                            <div className="small text-muted">Par {c.nom ?? c.name} — {c.created_at}</div>
                            <p>{c.message ?? c.content}</p>
                        </div>
                    </div>
                )) : <div className="card"><div className="card-body">Aucun commentaire</div></div>}
            </div>
        </div>
    );
}
