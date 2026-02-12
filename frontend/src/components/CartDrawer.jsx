import { FiX, FiMinus, FiPlus, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

export default function CartDrawer() {
    const {
        items, isOpen, setIsOpen, removeItem,
        updateQuantity, totalItems, totalPrice
    } = useCart();

    const navigate = useNavigate();

    const handleGoToCheckout = () => {
        setIsOpen(false);
        navigate('/checkout');
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
                                        <div className="cart-item-size">
                                            {item.size !== 'Único' && `Talle: ${item.size}`}
                                            {item.size !== 'Único' && item.color && ' | '}
                                            {item.color && (
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                    Color:
                                                    <span style={{
                                                        width: '12px', height: '12px', borderRadius: '50%',
                                                        background: item.color, border: '1px solid #ccc', display: 'inline-block'
                                                    }} title={item.color}></span>
                                                </span>
                                            )}
                                        </div>
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
                        <div className="cart-summary">
                            <div className="summary-total">
                                <span>Total (sin envío)</span>
                                <span>${totalPrice.toLocaleString('es-AR')}</span>
                            </div>
                        </div>

                        <button
                            className="cart-checkout-btn"
                            onClick={handleGoToCheckout}
                        >
                            Iniciar Compra <FiArrowRight />
                        </button>
                    </div>
                )}
            </div>
            <style>{`
                .cart-footer {
                    padding: 1.5rem;
                    background: #fff;
                    border-top: 1px solid var(--border-light);
                    display: flex; flex-direction: column; gap: 1.5rem;
                }
                .summary-total {
                    display: flex; justify-content: space-between; align-items: center;
                    font-size: 1.2rem; font-weight: 700; color: var(--text-primary);
                }
                
                .cart-checkout-btn {
                    width: 100%; padding: 16px; background: var(--primary); color: white;
                    border: none; border-radius: 50px; font-size: 1.1rem; font-weight: 600;
                    cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px;
                    transition: all 0.3s; box-shadow: 0 4px 15px rgba(235, 122, 169, 0.3);
                }
                .cart-checkout-btn:hover { background: var(--primary-dark); transform: translateY(-2px); box-shadow: 0 6px 20px rgba(235, 122, 169, 0.4); }
            `}</style>
        </>
    );
}
