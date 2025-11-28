import React from 'react';

export default function Home() {
    // user auth payload set by Blade view (monopage.blade.php)
    const userData = (typeof window.user_auth_data !== 'undefined') ? window.user_auth_data : { isLoggedin: false, user: null };

    return (
        <div className="card">
            <div className="card-body">
                <h2 className="card-title">Bienvenue sur l'application React</h2>
                <p className="card-text">Ceci est la façade single-page (React) intégrée avec Laravel / Vite.</p>

                <hr />
                <div>
                    <strong>Authentifié :</strong> {userData.isLoggedin ? 'Oui' : 'Non'}
                    {userData.isLoggedin && (
                        <div className="mt-2 small text-muted">
                            <div><strong>Nom:</strong> {userData.user.name}</div>
                            <div><strong>Email:</strong> {userData.user.email}</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
