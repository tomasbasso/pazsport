import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { FiPackage, FiGrid, FiLogOut, FiHome } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
    const { isAuthenticated, logout, user } = useAuth();

    if (!isAuthenticated) return <Navigate to="/admin/login" replace />;

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="admin-sidebar-logo">
                    <img src="/logo.png" alt="PazSport" />
                    <span>Paz Sport</span>
                </div>
                <p className="admin-sidebar-subtitle">Panel de Administración</p>

                <nav className="admin-nav">
                    <NavLink to="/admin/products" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
                        <FiPackage /> Productos
                    </NavLink>
                    <NavLink to="/admin/categories" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
                        <FiGrid /> Categorías
                    </NavLink>

                    <div className="admin-nav-bottom">
                        <NavLink to="/" className="admin-nav-item">
                            <FiHome /> Ver Tienda
                        </NavLink>
                        <button className="admin-nav-item" onClick={logout} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', fontSize: 'inherit' }}>
                            <FiLogOut /> Cerrar Sesión
                        </button>
                    </div>
                </nav>
            </aside>

            <main className="admin-main">
                <Outlet />
            </main>
        </div>
    );
}
