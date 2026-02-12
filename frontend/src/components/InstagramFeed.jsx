import { FaInstagram } from 'react-icons/fa';

export default function InstagramFeed() {
    return (
        <section className="instagram-section">
            <div className="instagram-header">
                <div className="instagram-title">
                    <FaInstagram className="insta-icon" />
                    <h3>@pazsport</h3>
                </div>
                <p>Seguinos para ver novedades y promos exclusivas</p>
                <a
                    href="https://www.instagram.com/pazsport/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="insta-follow-btn"
                >
                    Seguir
                </a>
            </div>

            <style>{`
                .instagram-section {
                    padding: 2rem 5%;
                    background: #fff;
                    text-align: center;
                    margin-bottom: 1rem;
                }
                .instagram-header {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                }
                .instagram-title {
                    display: flex; align-items: center; gap: 10px;
                    font-size: 1.5rem; font-weight: 700; color: var(--text-primary);
                }
                .insta-icon { color: #E1306C; font-size: 1.8rem; }
                .instagram-header p {
                    color: var(--text-secondary);
                    font-size: 1rem;
                }
                .insta-follow-btn {
                    padding: 8px 24px;
                    background: var(--text-primary);
                    color: white;
                    border-radius: 50px;
                    text-decoration: none;
                    font-weight: 600;
                    font-size: 0.9rem;
                    transition: all 0.3s ease;
                }
                .insta-follow-btn:hover {
                    background: var(--accent);
                    transform: translateY(-2px);
                }

                @media (max-width: 768px) {
                    .instagram-section {
                        padding: 2rem 5%;
                    }
                }
            `}</style>
        </section>
    );
}
