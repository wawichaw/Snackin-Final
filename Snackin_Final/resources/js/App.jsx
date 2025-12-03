import React from "react";
import { HashRouter, Routes, Route, Link } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Landing from "./components/landing/Landing";
import BiscuitsIndex from "./components/biscuits/BiscuitsIndex";
import BiscuitShow from "./components/biscuits/BiscuitShow";
import SaveursIndex from "./components/saveurs/SaveursIndex";
import CommentairesPublic from "./components/commentaires/CommentairesPublic";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import CommandeCreate from "./components/commandes/CommandeCreate";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminBiscuits from "./components/admin/AdminBiscuits";
import AdminSaveurs from "./components/admin/AdminSaveurs";
import AdminCommandes from "./components/admin/AdminCommandes";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./components/Home";
import About from "./components/About";

import { useNavigate } from "react-router-dom";

function UserMenu() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    if (!user)
        return (
            <>
                <li className="nav-item me-2">
                    <Link to="/login" className="nav-link">
                        Se connecter
                    </Link>
                </li>
                <li className="nav-item">
                    <Link to="/register" className="nav-link">
                        S'inscrire
                    </Link>
                </li>
            </>
        );

    const doLogout = async () => {
        await logout();
        navigate("/");
    };

    return (
        <li className="nav-item dropdown">
            <span className="nav-link dropdown-toggle" role="button">
                {user.name}
            </span>
            <div
                className="dropdown-menu dropdown-menu-end shadow"
                style={{ minWidth: 160 }}
            >
                {user.role === "ADMIN" && (
                    <Link to="/admin" className="dropdown-item">
                        Admin
                    </Link>
                )}
                <button className="dropdown-item" onClick={doLogout}>
                    Se déconnecter
                </button>
            </div>
        </li>
    );
}

export default function App() {
    return (
        <HashRouter>
            {/* Top navbar - simplified copy of Blade partial styling (Bootstrap classes) */}
            <nav className="navbar navbar-expand-md navbar-light bg-white shadow-sm">
                <div className="container">
                    <a className="navbar-brand fw-bold text-danger" href="#/">
                        Snackin
                    </a>
                    <div
                        className="collapse navbar-collapse show"
                        id="navbarSupportedContent"
                    >
                        <ul className="navbar-nav me-auto mb-2 mb-md-0">
                            <li className="nav-item">
                                <Link to="/biscuits" className="nav-link">
                                    Biscuits
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/saveurs" className="nav-link">
                                    Saveurs
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/commentaires" className="nav-link">
                                    Commentaires
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/about" className="nav-link">
                                    À propos
                                </Link>
                            </li>
                        </ul>

                        <ul className="navbar-nav ms-auto d-flex align-items-center">
                            <UserMenu />
                        </ul>
                    </div>
                </div>
            </nav>

            <main className="py-4">
                <div
                    className="container"
                    style={{ maxWidth: 1200, padding: "20px" }}
                >
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/" element={<Landing />} />
                        <Route path="/home" element={<Home />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/biscuits" element={<BiscuitsIndex />} />
                        <Route path="/biscuits/:id" element={<BiscuitShow />} />
                        <Route path="/saveurs" element={<SaveursIndex />} />
                        <Route
                            path="/commentaires"
                            element={<CommentairesPublic />}
                        />
                        <Route
                            path="/commandes/create"
                            element={<CommandeCreate />}
                        />

                        {/* Admin routes (protected) */}
                        <Route
                            path="/admin"
                            element={
                                <ProtectedRoute adminOnly>
                                    <AdminDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/biscuits"
                            element={<AdminBiscuits />}
                        />
                        <Route
                            path="/admin/saveurs"
                            element={
                                <ProtectedRoute adminOnly>
                                    <AdminSaveurs />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/commandes"
                            element={
                                <ProtectedRoute adminOnly>
                                    <AdminCommandes />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </div>
            </main>
        </HashRouter>
    );
}
