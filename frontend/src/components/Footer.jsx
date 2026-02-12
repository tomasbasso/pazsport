import { FiInstagram } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

export default function Footer() {
    return (
        <footer className="footer" id="contacto">
            <div className="footer-inner">
                <div className="footer-logo">Paz Sport</div>
                <div className="footer-links">
                    <a href="https://wa.me/5492302462479" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                        <FaWhatsapp />
                    </a>
                    <a href="https://www.instagram.com/pazsport/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                        <FiInstagram />
                    </a>
                </div>
                <p className="footer-copy">© {new Date().getFullYear()} PazSport · Indumentaria Deportiva Premium</p>
            </div>
        </footer>
    );
}
