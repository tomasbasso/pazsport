import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, loading } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            navigate('/admin/products');
        } catch (err) {
            setError(typeof err === 'string' ? err : 'Error al iniciar sesión');
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-logo">
                    <img src="/logo.png" alt="PazSport" />
                    <span>Paz Sport</span>
                </div>
                <p className="login-subtitle">Panel de Administración</p>

                {error && <div className="login-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Correo electrónico</label>
                        <input
                            id="email" type="email" value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@pazsport.com" required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            id="password" type="password" value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••" required
                        />
                    </div>
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Ingresando...' : 'Iniciar Sesión'}
                    </button>
                </form>

                <Link to="/" className="login-back">← Volver a la tienda</Link>
            </div>
        </div>
    );
}
