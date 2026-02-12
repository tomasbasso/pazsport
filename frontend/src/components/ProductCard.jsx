import { useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

export default function ProductCard({ product }) {
    const { addItem } = useCart();
    const [selectedSize, setSelectedSize] = useState(null);

    const handleAdd = () => {
        if (!selectedSize && product.sizes?.length > 0) {
            // Si tiene talles, seleccionar el primero por defecto
            const size = product.sizes[0];
            setSelectedSize(size);
            addItem(product, size);
        } else {
            addItem(product, selectedSize || 'Único');
        }
    };

    const imageUrl = product.image ? `${API_BASE}${product.image}` : null;

    return (
        <div className="product-card">
            <div className="product-card-image">
                <Link to={`/product/${product.id}`} style={{ display: 'block', width: '100%', height: '100%', textDecoration: 'none' }}>
                    {product.image ? (
                        <img src={`${API_BASE}${product.image}`} alt={product.name} loading="lazy" />
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

                {product.sizes?.length > 0 && (
                    <div className="product-card-sizes">
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

                <button
                    className="product-card-add"
                    onClick={handleAdd}
                    disabled={product.stock <= 0}
                >
                    <FiPlus /> {product.stock > 0 ? 'Agregar al pedido' : 'Sin Stock'}
                </button>
            </div>
        </div>
    );
}
