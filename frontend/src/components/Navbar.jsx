import { Link, useLocation } from 'react-router-dom';
import { FiShoppingBag, FiMenu, FiX } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useState } from 'react';

export default function Navbar() {
    const { totalItems, setIsOpen } = useCart();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    // No mostrar navbar en rutas admin
    if (location.pathname.startsWith('/admin')) return null;

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                {/* Mobile Menu Toggle */}
                <button className="navbar-hamburger" onClick={toggleMenu} aria-label="Menú">
                    {isMenuOpen ? <FiX /> : <FiMenu />}
                </button>

                <Link to="/" className="navbar-logo" onClick={closeMenu}>
                    <img src="/logo.png" alt="PazSport" />
                    <span>Paz Sport</span>
                </Link>

                <ul className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
                    <li><Link to="/" onClick={closeMenu} className={location.pathname === '/' ? 'active' : ''}>Inicio</Link></li>
                    <li><a href="#catalogo" onClick={closeMenu}>Catálogo</a></li>
                    <li><a href="#contacto" onClick={closeMenu}>Contacto</a></li>
                </ul>

                <button className="navbar-cart" onClick={() => setIsOpen(true)} aria-label="Abrir carrito">
                    <FiShoppingBag />
                    {totalItems > 0 && (
                        <span className="navbar-cart-badge">{totalItems}</span>
                    )}
                </button>
            </div>

            {/* Overlay for mobile menu */}
            {isMenuOpen && <div className="navbar-overlay" onClick={closeMenu}></div>}
        </nav>
    );
}
