import React from "react";
import { HashRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
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
import SearchBar from "./components/SearchBar";

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
                <Link className="dropdown-item" to="/admin">
                    Tableau de bord
                </Link>
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
            {/* Navbar */}
            <nav className="navbar navbar-expand-lg navbar-light bg-light border-bottom mb-4">
                <div className="container-fluid">
                    <Link className="navbar-brand" to="/">
                        Snackin
                    </Link>

                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#mainNavbar"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="mainNavbar">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <Link className="nav-link" to="/biscuits">
                                    Biscuits
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/saveurs">
                                    Saveurs
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/commentaires">
                                    Commentaires
                                </Link>
                            </li>
                        </ul>

                        <SearchBar />

                        <ul className="navbar-nav ms-3">
                            <UserMenu />
                        </ul>
                    </div>
                </div>
            </nav>

            {/* Contenu principal */}
            <main className="container">
                <div className="row">
                    <div className="col-12 col-lg-9 mb-4">
                        <Routes>
                            <Route path="/" element={<Landing />} />
                            <Route path="/home" element={<Home />} />
                            <Route path="/about" element={<About />} />

                            <Route
                                path="/biscuits"
                                element={<BiscuitsIndex />}
                            />
                            <Route
                                path="/biscuits/:id"
                                element={<BiscuitShow />}
                            />

                            <Route path="/saveurs" element={<SaveursIndex />} />

                            <Route
                                path="/commentaires"
                                element={<CommentairesPublic />}
                            />

                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />

                            <Route
                                path="/commander"
                                element={
                                    <ProtectedRoute>
                                        <CommandeCreate />
                                    </ProtectedRoute>
                                }
                            />

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
                                element={
                                    <ProtectedRoute adminOnly>
                                        <AdminBiscuits />
                                    </ProtectedRoute>
                                }
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
                </div>
            </main>
        </HashRouter>
    );
}
