import { useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

export default function ProductCard({ product }) {
    const { addItem } = useCart();
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);

    const handleAdd = () => {
        if (product.colors?.length > 0 && !selectedColor) {
            alert('Por favor seleccioná un color');
            return;
        }

        const sizeToAdd = selectedSize || (product.sizes?.length > 0 ? product.sizes[0] : 'Único');
        const colorToAdd = selectedColor || null;

        addItem(product, sizeToAdd, 1, colorToAdd);

        if (product.sizes?.length > 0 && !selectedSize) setSelectedSize(sizeToAdd);
    };

    const imageUrl = product.image
        ? (product.image.startsWith('data:') || product.image.startsWith('http') ? product.image : `${API_BASE}${product.image}`)
        : null;

    return (
        <div className="product-card">
            <div className="product-card-image">
                <Link to={`/product/${product.id}`} style={{ display: 'block', width: '100%', height: '100%', textDecoration: 'none' }}>
                    {product.image ? (
                        <img src={imageUrl} alt={product.name} loading="lazy" />
                    ) : (
                        <span style={{ fontSize: '3rem', display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>🧢</span>
                    )}
                </Link>
            </div>
            <div className="product-card-body">
                <h3 className="product-card-name">{product.name}</h3>
                <p className="product-card-desc">{product.description || 'Indumentaria deportiva premium'}</p>
                <div className="product-card-price">
                    ${product.price?.toLocaleString('es-AR')}
                </div>

                <div className="product-card-options" style={{ marginBottom: '10px' }}>
                    {product.sizes?.length > 0 && (
                        <div className="product-card-sizes" style={{ marginBottom: '8px' }}>
                            {product.sizes.map(size => (
                                <span
                                    key={size}
                                    className={`size-badge ${selectedSize === size ? 'selected' : ''}`}
                                    onClick={() => setSelectedSize(size)}
                                >
                                    {size}
                                </span>
                            ))}
                        </div>
                    )}

                    {product.colors?.length > 0 && (
                        <div className="product-card-colors" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {product.colors.map(color => (
                                <span
                                    key={color}
                                    style={{
                                        width: '18px', height: '18px', borderRadius: '50%',
                                        background: color, border: selectedColor === color ? '2px solid var(--accent)' : '1px solid #ddd',
                                        cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }}
                                    onClick={() => setSelectedColor(color)}
                                    title={color}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <button
                    className="product-card-add"
                    onClick={handleAdd}
                    disabled={product.stock <= 0}
                >
                    <FiPlus /> {product.stock > 0 ? 'Agregar' : 'Sin Stock'}
                </button>
            </div>
        </div>
    );
}
