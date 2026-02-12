import { Link, useLocation } from 'react-router-dom';
import { FiShoppingBag, FiMenu } from 'react-icons/fi';
import { useCart } from '../context/CartContext';

export default function Navbar() {
    const { totalItems, setIsOpen } = useCart();
    const location = useLocation();

    // No mostrar navbar en rutas admin
    if (location.pathname.startsWith('/admin')) return null;

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <Link to="/" className="navbar-logo">
                    <img src="/logo.png" alt="PazSport" />
                    <span>Paz Sport</span>
                </Link>

                <ul className="navbar-links">
                    <li><Link to="/" className={location.pathname === '/' ? 'active' : ''}>Inicio</Link></li>
                    <li><a href="#catalogo">Catálogo</a></li>
                    <li><a href="#contacto">Contacto</a></li>
                </ul>

                <button className="navbar-cart" onClick={() => setIsOpen(true)} aria-label="Abrir carrito">
                    <FiShoppingBag />
                    {totalItems > 0 && (
                        <span className="navbar-cart-badge">{totalItems}</span>
                    )}
                </button>
            </div>
        </nav>
    );
}
