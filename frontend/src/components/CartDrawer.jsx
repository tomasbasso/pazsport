import { FiX, FiMinus, FiPlus, FiShoppingBag } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useCart } from '../context/CartContext';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

export default function CartDrawer() {
    const {
        items, isOpen, setIsOpen, removeItem,
        updateQuantity, totalItems, totalPrice,
        generateWhatsAppMessage, calculateShipping, shippingCost, zipCode
    } = useCart();

    const handleCheckout = () => {
        const url = generateWhatsAppMessage();
        window.open(url, '_blank');
    };

    return (
        <>
            <div className={`cart-overlay ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(false)} />
            <div className={`cart-drawer ${isOpen ? 'open' : ''}`}>
                <div className="cart-header">
                    <h2>Tu Pedido ({totalItems})</h2>
                    <button className="cart-close" onClick={() => setIsOpen(false)}><FiX /></button>
                </div>

                <div className="cart-items">
                    {items.length === 0 ? (
                        <div className="cart-empty">
                            <div className="cart-empty-icon"><FiShoppingBag /></div>
                            <p>Tu pedido está vacío</p>
                            <p style={{ fontSize: '0.9rem', marginTop: '8px', color: 'var(--text-light)' }}>
                                Agregá productos desde el catálogo
                            </p>
                        </div>
                    ) : (
                        items.map((item) => {
                            const imageUrl = item.product.image
                                ? `${API_BASE}${item.product.image}`
                                : null;

                            return (
                                <div className="cart-item" key={`${item.product.id}-${item.size}`}>
                                    {imageUrl ? (
                                        <img src={imageUrl} alt={item.product.name} className="cart-item-image" />
                                    ) : (
                                        <div className="cart-item-image" style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '1.5rem', color: 'var(--primary-dark)', background: 'var(--primary-light)'
                                        }}>🏃</div>
                                    )}
                                    <div className="cart-item-info">
                                        <div className="cart-item-name">{item.product.name}</div>
                                        <div className="cart-item-size">Talle: {item.size}</div>
                                        <div className="cart-item-price">
                                            ${(item.product.price * item.quantity).toLocaleString('es-AR')}
                                        </div>
                                        <div className="cart-item-qty">
                                            <button onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}>
                                                <FiMinus />
                                            </button>
                                            <span>{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}>
                                                <FiPlus />
                                            </button>
                                        </div>
                                    </div>
                                    <button
                                        className="cart-item-remove"
                                        onClick={() => removeItem(item.product.id, item.size)}
                                    >
                                        <FiX />
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>

                {items.length > 0 && (
                    <div className="cart-footer">
                        {/* Calculadora de Envío */}
                        <div className="shipping-calculator" style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-light)' }}>
                            <label htmlFor="zipCode" style={{ fontSize: '0.9rem', fontWeight: '600', display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                                Calcular Envío (Ingresá tu CP)
                            </label>
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '0.8rem' }}>
                                <input
                                    type="number"
                                    id="zipCode"
                                    placeholder="Ej: 6313"
                                    value={zipCode}
                                    onChange={(e) => calculateShipping(e.target.value)}
                                    style={{
                                        padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)',
                                        width: '100%', fontSize: '0.95rem', background: 'var(--surface-alt)'
                                    }}
                                />
                            </div>
                            {zipCode && (
                                <div style={{
                                    fontSize: '0.9rem',
                                    color: shippingCost === 0 ? 'var(--success)' : 'var(--text-primary)',
                                    padding: '10px',
                                    background: shippingCost === 0 ? '#e8f8ef' : 'var(--surface-alt)',
                                    borderRadius: '8px',
                                    fontWeight: '500',
                                    display: 'flex', alignItems: 'center', gap: '8px'
                                }}>
                                    {shippingCost === 0
                                        ? (zipCode === '6313' ? '📍 Winifreda: Envío Gratis / Retiro' : 'Consultar opciones')
                                        : `🚚 Costo de envío: $${shippingCost.toLocaleString('es-AR')}`
                                    }
                                </div>
                            )}
                        </div>

                        <div className="cart-total" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                                <span>Subtotal</span>
                                <span>${totalPrice.toLocaleString('es-AR')}</span>
                            </div>

                            {/* Mostrar envío solo si se calculó */}
                            {shippingCost > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                                    <span>Envío</span>
                                    <span>${shippingCost.toLocaleString('es-AR')}</span>
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '1.4rem', fontWeight: '800', borderTop: '1px solid var(--border)', paddingTop: '15px', marginTop: '5px' }}>
                                <span>Total</span>
                                <span className="cart-total-price">${(totalPrice + shippingCost).toLocaleString('es-AR')}</span>
                            </div>
                        </div>

                        <button className="cart-whatsapp-btn" onClick={handleCheckout} style={{ marginTop: '1.5rem' }}>
                            <FaWhatsapp size={20} /> Enviar Pedido por WhatsApp
                        </button>
                        <p className="cart-whatsapp-note">
                            Serás redirigido/a a WhatsApp con el detalle del pedido y los datos de envío.
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}
