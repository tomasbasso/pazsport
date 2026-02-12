import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiMinus, FiPlus, FiShoppingBag } from 'react-icons/fi';
import { productsAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import Footer from '../components/Footer';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addItem } = useCart();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        loadProduct();
        window.scrollTo(0, 0);
    }, [id]);

    async function loadProduct() {
        try {
            const { data } = await productsAPI.getById(id);
            setProduct(data);
            if (data.sizes?.length > 0) setSelectedSize(data.sizes[0]);
            // No auto-seleccionar color para obligar al usuario a elegir
            // if (data.colors?.length > 0) setSelectedColor(data.colors[0]);
        } catch (err) {
            console.error('Error cargando producto:', err);
            navigate('/'); // Redirigir si falla (o mostrar 404)
        } finally {
            setLoading(false);
        }
    }

    const handleAddToCart = () => {
        if (!product) return;

        if (product.colors?.length > 0 && !selectedColor) {
            alert('Por favor elegí un color');
            return;
        }

        const sizeToAdd = selectedSize || 'Único';
        const colorToAdd = selectedColor || null;
        addItem(product, sizeToAdd, quantity, colorToAdd);
        // Opcional: Mostrar feedback o abrir carrito
    };

    if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;
    if (!product) return null;

    const imageUrl = product.image
        ? (product.image.startsWith('data:') || product.image.startsWith('http') ? product.image : `${API_BASE}${product.image}`)
        : null;

    return (
        <>
            <div className="product-detail-page">
                <div className="product-detail-container">
                    <button onClick={() => navigate(-1)} className="back-btn">
                        <FiArrowLeft /> Volver
                    </button>

                    <div className="product-detail-grid">
                        {/* Galería / Imagen */}
                        <div className="product-detail-image-container">
                            {imageUrl ? (
                                <img src={imageUrl} alt={product.name} className="product-detail-img" />
                            ) : (
                                <div className="product-detail-placeholder">
                                    <span>🧢</span>
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="product-detail-info">
                            <h1 className="product-title">{product.name}</h1>
                            <div className="product-price">${product.price?.toLocaleString('es-AR')}</div>

                            <p className="product-description">
                                {product.description || 'Indumentaria deportiva premium diseñada para el máximo rendimiento y confort.'}
                            </p>

                            <div className="product-meta">
                                {/* Talles */}
                                {product.sizes?.length > 0 && (
                                    <div className="meta-group">
                                        <label>Talle</label>
                                        <div className="size-selector">
                                            {product.sizes.map(size => (
                                                <button
                                                    key={size}
                                                    className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                                                    onClick={() => setSelectedSize(size)}
                                                >
                                                    {size}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Cantidad y Color */}
                                {product.colors?.length > 0 && (
                                    <div className="meta-group">
                                        <label>Color</label>
                                        <div className="color-selector" style={{ display: 'flex', gap: '10px' }}>
                                            {product.colors.map(color => (
                                                <button
                                                    key={color}
                                                    className={`color-btn ${selectedColor === color ? 'active' : ''}`}
                                                    onClick={() => setSelectedColor(color)}
                                                    title={color}
                                                    style={{
                                                        width: '32px', height: '32px', borderRadius: '50%',
                                                        background: color, border: selectedColor === color ? '2px solid var(--accent)' : '1px solid #ddd',
                                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)', cursor: 'pointer',
                                                        transform: selectedColor === color ? 'scale(1.1)' : 'scale(1)',
                                                        transition: 'transform 0.2s ease'
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="meta-group">
                                    <label>Cantidad</label>
                                    <div className="quantity-selector">
                                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))}><FiMinus /></button>
                                        <span>{quantity}</span>
                                        <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}><FiPlus /></button>
                                    </div>
                                </div>
                            </div>

                            <button
                                className="add-to-cart-btn"
                                onClick={handleAddToCart}
                                disabled={product.stock <= 0}
                            >
                                <FiShoppingBag />
                                {product.stock > 0 ? 'Agregar al Pedido' : 'Sin Stock'}
                            </button>

                            <div className="product-features">
                                <div className="feature">✓ Envío a todo el país</div>
                                <div className="feature">✓ Devolución hasta 30 días</div>
                                <div className="feature">✓ Calidad Premium Garantizada</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />

            <style>{`
                .product-detail-page {
                    min-height: 100vh;
                    background: var(--background);
                    padding: 2rem;
                    padding-top: 100px; /* Navbar space */
                }
                .product-detail-container {
                    max-width: 1100px;
                    margin: 0 auto;
                }
                .back-btn {
                    display: inline-flex; align-items: center; gap: 8px;
                    background: none; border: none;
                    color: var(--text-secondary);
                    font-weight: 500; cursor: pointer;
                    margin-bottom: 2rem; transition: var(--transition);
                }
                .back-btn:hover { color: var(--accent); transform: translateX(-4px); }
                
                .product-detail-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 3rem;
                    background: var(--surface);
                    border-radius: var(--radius-lg); /** Use lg for larger radius */
                    padding: 2rem;
                    box-shadow: var(--shadow-sm); /** Use sm for subtle shadow */
                    border: 1px solid var(--border-light);
                }

                @media (max-width: 768px) {
                    .product-detail-grid { grid-template-columns: 1fr; gap: 2rem; }
                    .product-detail-page { padding: 1rem; padding-top: 90px; }
                }

                .product-detail-image-container {
                    width: 100%;
                    aspect-ratio: 1;
                    border-radius: var(--radius-md);
                    overflow: hidden;
                    background: linear-gradient(135deg, var(--primary-light), var(--surface-alt));
                    display: flex; align-items: center; justify-content: center;
                }
                .product-detail-img {
                    width: 100%; height: 100%; object-fit: cover;
                    transition: transform 0.6s ease;
                }
                .product-detail-img:hover { transform: scale(1.05); }
                .product-detail-placeholder { font-size: 5rem; opacity: 0.2; }

                .product-title {
                    font-family: var(--font-display);
                    font-size: 2.5rem; font-weight: 700;
                    margin-bottom: 0.5rem;
                    color: var(--text-primary);
                    line-height: 1.2;
                }
                .product-price {
                    font-size: 2rem; font-weight: 700;
                    color: var(--accent); margin-bottom: 1.5rem;
                }
                .product-description {
                    color: var(--text-secondary);
                    font-size: 1.05rem; line-height: 1.7;
                    margin-bottom: 2rem;
                }

                .product-meta {
                    margin-bottom: 2rem;
                    display: flex; flex-direction: column; gap: 1.5rem;
                }
                .meta-group label {
                    display: block; font-size: 0.9rem; font-weight: 600;
                    margin-bottom: 0.5rem; color: var(--text-primary);
                }
                
                .size-selector { display: flex; gap: 10px; flex-wrap: wrap; }
                .size-btn {
                    padding: 10px 20px;
                    border: 1px solid var(--border);
                    background: var(--surface);
                    border-radius: var(--radius-full);
                    cursor: pointer; font-weight: 500;
                    transition: var(--transition);
                }
                .size-btn:hover { border-color: var(--accent); color: var(--accent); }
                .size-btn.active {
                    background: var(--accent); color: white; border-color: var(--accent);
                    box-shadow: var(--shadow-accent);
                }

                .quantity-selector {
                    display: inline-flex; align-items: center; gap: 15px;
                    padding: 8px 16px;
                    border: 1px solid var(--border);
                    border-radius: var(--radius-full);
                    background: var(--surface-alt);
                }
                .quantity-selector button {
                    background: white; border: none;
                    width: 32px; height: 32px; border-radius: 50%;
                    cursor: pointer; display: flex; align-items: center; justify-content: center;
                    box-shadow: var(--shadow-xs);
                    color: var(--text-secondary); transition: var(--transition);
                }
                .quantity-selector button:hover { color: var(--accent); transform: scale(1.1); }
                .quantity-selector span { font-weight: 600; font-size: 1.1rem; min-width: 24px; text-align: center; }

                .add-to-cart-btn {
                    width: 100%; padding: 18px;
                    background: var(--accent); color: white;
                    border: none; border-radius: var(--radius-md);
                    font-size: 1.1rem; font-weight: 700;
                    cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px;
                    transition: var(--transition);
                    box-shadow: var(--shadow-accent);
                    margin-bottom: 2rem;
                }
                .add-to-cart-btn:hover {
                    background: var(--accent-hover);
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-md);
                }
                .add-to-cart-btn:disabled {
                    background: var(--text-light); cursor: not-allowed;
                    transform: none; box-shadow: none; opacity: 0.7;
                }

                .product-features {
                    border-top: 1px solid var(--border-light);
                    padding-top: 1.5rem;
                }
                .feature {
                    color: var(--text-secondary); font-size: 0.9rem;
                    margin-bottom: 0.5rem; display: flex; align-items: center; gap: 8px;
                }
            `}</style>
        </>
    );
}
