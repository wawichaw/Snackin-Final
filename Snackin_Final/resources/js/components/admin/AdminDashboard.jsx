import React from "react";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
    return (
        <div>
            <h2>Tableau de bord admin</h2>
            <div className="grid">
                <div className="card">
                    <div className="card-body">
                        <Link to="/admin/biscuits" className="btn">
                            Gérer les biscuits
                        </Link>
                    </div>
                </div>
                <div className="card">
                    <div className="card-body">
                        <Link to="/admin/saveurs" className="btn">
                            Gérer les saveurs
                        </Link>
                    </div>
                </div>

                <div className="card">
                    <div className="card-body">
                        <Link to="/admin/commandes" className="btn">
                            Gérer les commandes
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
