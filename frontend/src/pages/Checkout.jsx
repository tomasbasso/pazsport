import { useCart } from '../context/CartContext';
import { FiArrowLeft, FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

export default function Checkout() {
    const {
        items, updateQuantity, removeItem, totalPrice,
        calculateShipping, shippingCost, zipCode,
        customer, setCustomer, generateWhatsAppMessage
    } = useCart();

    const handleCheckout = () => {
        if (!customer.name) return;
        const url = generateWhatsAppMessage();
        window.open(url, '_blank');
    };

    if (items.length === 0) {
        return (
            <div className="checkout-page empty-state">
                <div className="empty-content">
                    <h2>Tu carrito está vacío</h2>
                    <p>Agregá productos para comenzar tu compra.</p>
                    <Link to="/" className="btn-primary">Volver al Catálogo</Link>
                </div>
                <style>{`
                    .empty-state { display: flex; align-items: center; justify-content: center; text-align: center; }
                    .btn-primary { background: var(--primary); color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; margin-top: 1rem; display: inline-block; }
                `}</style>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <div className="checkout-container">
                <div className="checkout-header">
                    <Link to="/" className="back-link"><FiArrowLeft /> Seguir Comprando</Link>
                    <h1>Finalizar Compra</h1>
                </div>

                <div className="checkout-grid">
                    {/* Columna Izquierda: Formulario */}
                    <div className="checkout-form-section">
                        {/* 1. Datos de Envío */}
                        <div className="checkout-card">
                            <h3>1. Envío</h3>
                            <div className="form-group">
                                <label>Código Postal</label>
                                <div className="zip-input-group">
                                    <input
                                        type="number"
                                        placeholder="Ej: 6313"
                                        value={zipCode}
                                        onChange={(e) => calculateShipping(e.target.value)}
                                        className="input-field"
                                    />
                                    {zipCode && (
                                        <div className={`shipping-badge ${shippingCost === 0 ? 'free' : ''}`}>
                                            {shippingCost === 0
                                                ? (zipCode === '6313' ? 'Envío Gratis (Winifreda)' : 'Consultar')
                                                : `$${shippingCost.toLocaleString('es-AR')}`}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 2. Datos del Cliente */}
                        <div className="checkout-card">
                            <h3>2. Tus Datos</h3>
                            <div className="form-group">
                                <label>Nombre Completo *</label>
                                <input
                                    type="text"
                                    placeholder="Nombre y Apellido"
                                    value={customer.name}
                                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                            <div className="form-group">
                                <label>Dirección de Envío</label>
                                <input
                                    type="text"
                                    placeholder="Calle, Número, Piso..."
                                    value={customer.address}
                                    onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                        </div>

                        {/* 3. Pago */}
                        <div className="checkout-card payment-card">
                            <h3>3. Pago</h3>
                            <div className="payment-info">
                                <p>Por favor realizá la transferencia a los siguientes datos:</p>
                                <div className="bank-details">
                                    <div className="bank-row"><span>Banco:</span> <strong>Mercado Pago</strong></div>
                                    <div className="bank-row"><span>Alias:</span> <code className="alias-badge" onClick={() => navigator.clipboard.writeText('pazsport')} title="Copiar alias">pazsport</code></div>
                                    <div className="bank-row"><span>Titular:</span> <strong>Maria Paz Maldonado</strong></div>
                                    <div className="bank-row"><span>CUIL:</span> <strong>27-41831394-9</strong></div>
                                </div>
                                <p className="payment-note">* Enviá el comprobante por WhatsApp al finalizar.</p>
                            </div>
                        </div>
                    </div>

                    {/* Columna Derecha: Resumen */}
                    <div className="checkout-summary-section">
                        <div className="checkout-summary-card">
                            <h3>Resumen del Pedido</h3>
                            <div className="summary-items">
                                {items.map(item => (
                                    <div key={`${item.product.id}-${item.size}`} className="summary-item">
                                        <div className="summary-item-image">
                                            {item.product.image ? (
                                                <img src={`${API_BASE}${item.product.image}`} alt={item.product.name} />
                                            ) : (
                                                <div className="placeholder-image">🏃</div>
                                            )}
                                        </div>
                                        <div className="summary-item-details">
                                            <h4>{item.product.name}</h4>
                                            <p className="size-text">Talle: {item.size}</p>
                                            <div className="summary-qty-controls">
                                                <button onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}><FiMinus /></button>
                                                <span>{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}><FiPlus /></button>
                                                <button onClick={() => removeItem(item.product.id, item.size)} className="remove-btn"><FiTrash2 /></button>
                                            </div>
                                        </div>
                                        <div className="summary-item-price">
                                            ${(item.product.price * item.quantity).toLocaleString('es-AR')}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="summary-totals">
                                <div className="total-row">
                                    <span>Subtotal</span>
                                    <span>${totalPrice.toLocaleString('es-AR')}</span>
                                </div>
                                {shippingCost > 0 && (
                                    <div className="total-row">
                                        <span>Envío</span>
                                        <span>${shippingCost.toLocaleString('es-AR')}</span>
                                    </div>
                                )}
                                <div className="total-row main-total">
                                    <span>Total</span>
                                    <span>${(totalPrice + shippingCost).toLocaleString('es-AR')}</span>
                                </div>
                            </div>

                            <button
                                className={`confirm-btn ${!customer.name ? 'disabled' : ''}`}
                                onClick={handleCheckout}
                                disabled={!customer.name}
                            >
                                <FaWhatsapp size={20} /> Confirmar Pedido
                            </button>
                            {!customer.name && <p className="required-msg">* Completá tu nombre para confirmar</p>}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .checkout-page {
                    padding: 120px 5% 60px;
                    background-color: #f8f9fa;
                    min-height: 100vh;
                    font-family: 'Outfit', sans-serif;
                }
                .checkout-container {
                    max-width: 1200px;
                    margin: 0 auto;
                }
                .checkout-header {
                    margin-bottom: 2rem;
                    display: flex; flex-direction: column; gap: 10px;
                }
                .back-link {
                    display: flex; align-items: center; gap: 8px;
                    color: var(--text-secondary); text-decoration: none; font-weight: 500;
                    width: fit-content; transition: color 0.2s; font-size: 0.95rem;
                }
                .back-link:hover { color: var(--accent); }
                .checkout-header h1 {
                    font-size: 2.2rem; color: var(--text-primary); font-weight: 700;
                }

                .checkout-grid {
                    display: grid;
                    grid-template-columns: 1fr 400px;
                    gap: 2rem;
                }

                .checkout-card, .checkout-summary-card {
                    background: white;
                    border-radius: 16px;
                    padding: 2rem;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.03);
                    margin-bottom: 1.5rem;
                    border: 1px solid var(--border-light);
                }
                
                .checkout-card h3, .checkout-summary-card h3 {
                    font-size: 1.1rem; margin-bottom: 1.5rem;
                    color: var(--text-primary); border-bottom: 2px solid var(--primary-light);
                    padding-bottom: 10px; display: inline-block; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;
                }

                .form-group { margin-bottom: 1.2rem; }
                .form-group label {
                    display: block; margin-bottom: 8px; font-weight: 600; color: var(--text-secondary); font-size: 0.9rem;
                }
                .input-field {
                    width: 100%; padding: 12px 16px; border: 1px solid var(--border);
                    border-radius: 8px; font-size: 0.95rem; transition: all 0.2s;
                    background: var(--surface-alt);
                }
                .input-field:focus {
                    background: white; border-color: var(--accent); outline: none; box-shadow: 0 0 0 3px rgba(192, 96, 144, 0.1);
                }

                .zip-input-group { display: flex; align-items: center; gap: 1rem; }
                .shipping-badge {
                    padding: 8px 16px; background: var(--surface-alt); border-radius: 8px;
                    font-weight: 600; font-size: 0.9rem; white-space: nowrap; color: var(--text-primary);
                }
                .shipping-badge.free { color: var(--success); background: #e8f8ef; }

                .bank-details {
                    background: #f1f3f5; padding: 1.2rem; border-radius: 10px;
                    margin: 1rem 0; border: 1px solid var(--border);
                }
                .bank-row {
                    display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.95rem;
                    border-bottom: 1px dashed rgba(0,0,0,0.05); padding-bottom: 4px;
                }
                .bank-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
                .alias-badge {
                    background: white; padding: 2px 6px; border-radius: 4px; border: 1px solid #ddd; font-family: monospace; cursor: pointer;
                }
                .payment-note { font-size: 0.85rem; color: var(--text-light); font-style: italic; }

                .summary-items { max-height: 400px; overflow-y: auto; margin-bottom: 1.5rem; padding-right: 5px; }
                .summary-item {
                    display: flex; gap: 1rem; padding-bottom: 1rem; margin-bottom: 1rem;
                    border-bottom: 1px solid var(--border-light);
                }
                .summary-item-image {
                    width: 60px; height: 60px; border-radius: 8px; overflow: hidden; background: #eee; flex-shrink: 0;
                }
                .summary-item-image img { width: 100%; height: 100%; object-fit: cover; }
                .placeholder-image { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
                
                .summary-item-details { flex: 1; }
                .summary-item-details h4 { font-size: 0.95rem; margin-bottom: 2px; font-weight: 600; }
                .size-text { font-size: 0.85rem; color: var(--text-light); }
                .summary-qty-controls {
                    display: flex; align-items: center; gap: 8px; margin-top: 6px;
                }
                .summary-qty-controls button {
                    width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;
                    border: 1px solid var(--border); background: white; border-radius: 4px; cursor: pointer; color: var(--text-secondary);
                }
                .summary-qty-controls button:hover { background: var(--surface-alt); color: var(--text-primary); }
                .remove-btn { color: #ff4d4f !important; border-color: rgba(255, 77, 79, 0.2) !important; margin-left: auto; }
                
                .summary-item-price { font-weight: 700; font-size: 1rem; color: var(--text-primary); }

                .summary-totals {
                    background: var(--surface-alt); padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem;
                }
                .total-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 1rem; color: var(--text-secondary); }
                .main-total {
                    font-weight: 800; font-size: 1.4rem; color: var(--text-primary);
                    margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border);
                }

                .confirm-btn {
                    width: 100%; padding: 16px; background: #25D366; color: white;
                    border: none; border-radius: 50px; font-size: 1.1rem; font-weight: 700;
                    cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px;
                    transition: all 0.3s;
                    box-shadow: 0 4px 15px rgba(37, 211, 102, 0.3);
                }
                .confirm-btn:hover { background: #20bd5a; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(37, 211, 102, 0.4); }
                .confirm-btn.disabled { background: #ccc; cursor: not-allowed; transform: none; box-shadow: none; }
                
                .required-msg { text-align: center; color: #ff4d4f; font-size: 0.85rem; margin-top: 10px; }

                @media (max-width: 900px) {
                    .checkout-grid { grid-template-columns: 1fr; }
                    .checkout-page { padding: 100px 5% 40px; }
                    .checkout-summary-section { order: -1; } /* Muestra resumen primero en mobile */
                }
            `}</style>
        </div>
    );
}
