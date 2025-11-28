import React from 'react';

export default function Landing(){
    return (
        <div className="hero">
            <div className="hero-inner">
                <div>
                    <div className="kickers">
                        <span>🍪 Frais du jour</span>
                        <span>🧁 Fait maison</span>
                        <span>🌸 Très cute</span>
                    </div>
                    <h1>Croquants dehors, fondants dedans. <br/> Les biscuits qui rendent tout le monde heureux.</h1>
                    <p>Gérez vos biscuits, découvrez les saveurs et passez vos commandes en 2 clics.</p>

                    <div className="cta-row">
                        <a className="btn primary" href="#/commandes/create">Commander</a>
                        <a className="btn" href="#/biscuits">Découvrez notre sélection</a>
                    </div>
                </div>

                <div className="hero-card">
                    <div className="hero-visual">
                        <img src="/Contenu/img/cookie-oreo.jpg" alt="Cookie Oreo" />
                    </div>
                    <span className="sticker">Best-seller ✨</span>
                </div>
            </div>
        </div>
    );
}
