import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, adminOnly = false }){
    const { user, token } = useAuth();

    // if not authenticated -> go to login
    if (!user && !token) {
        return <Navigate to="/login" replace />;
    }

    // if adminOnly and user not admin -> show a simple message
    if (adminOnly && user && !(user.is_admin || user.role === 'ADMIN')) {
        return <div className="card"><div className="card-body">Accès interdit — vous devez être administrateur.</div></div>;
    }

    return children;
}
