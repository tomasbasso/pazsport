import { useState } from 'react';
import { FiPlus, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatters';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

export default function ProductCard({ product }) {
    const { addItem } = useCart();
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

    let imagesList = [];
    if (product.images && product.images.length > 0) {
        imagesList = product.images;
    } else if (product.image) {
        imagesList = [product.image];
    }

    const formattedImages = imagesList.map(img =>
        (img.startsWith('data:') || img.startsWith('http') ? img : `${API_BASE}${img}`)
    );

    const imageUrl = formattedImages.length > 0 ? formattedImages[currentImageIndex] : null;

    const nextImage = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % formattedImages.length);
    };

    const prevImage = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev - 1 + formattedImages.length) % formattedImages.length);
    };

    return (
        <div className="product-card">
            <div className="product-card-image" style={{ position: 'relative' }}>
                {product.discount > 0 && (
                    <div className="product-card-badge">{product.discount}% OFF</div>
                )}
                <Link to={`/product/${product.id}`} style={{ display: 'block', width: '100%', height: '100%', textDecoration: 'none' }}>
                    {imageUrl ? (
                        <img src={imageUrl} alt={product.name} loading="lazy" />
                    ) : (
                        <span style={{ fontSize: '3rem', display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>🧢</span>
                    )}
                </Link>
                {formattedImages.length > 1 && (
                    <>
                        <button
                            className="card-carousel-arrow left"
                            onClick={prevImage}
                            aria-label="Anterior imagen"
                        >
                            <FiChevronLeft />
                        </button>
                        <button
                            className="card-carousel-arrow right"
                            onClick={nextImage}
                            aria-label="Siguiente imagen"
                        >
                            <FiChevronRight />
                        </button>
                    </>
                )}
            </div>
            <div className="product-card-body">
                <div className="product-card-header-row">
                    <h3 className="product-card-name">{product.name}</h3>
                    {product.colors?.length > 0 && (
                        <div className="product-card-colors" style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'flex-end', minWidth: '50px' }}>
                            {product.colors.map(color => (
                                <span
                                    key={color}
                                    style={{
                                        width: '14px', height: '14px',
                                        background: color, border: selectedColor === color ? '1px solid var(--text-primary)' : '1px solid #ddd',
                                        cursor: 'pointer',
                                    }}
                                    onClick={() => setSelectedColor(color)}
                                    title={color}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div className="product-card-price-row">
                    {product.discount > 0 ? (
                        <>
                            <span className="product-card-price-original">${formatPrice(product.price / (1 - product.discount / 100))}</span>
                            <span className="product-card-price">${formatPrice(product.price)}</span>
                        </>
                    ) : (
                        <span className="product-card-price" style={{ color: 'var(--text-primary)' }}>
                            ${formatPrice(product.price)}
                        </span>
                    )}
                </div>

                <div className="product-card-tax">
                    ${formatPrice(product.price / 1.21)} Precio sin impuestos
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
                </div>

                <button
                    className="product-card-add"
                    onClick={handleAdd}
                    disabled={product.stock <= 0}
                >
                    <FiPlus /> {product.stock > 0 ? 'Agregar' : 'Sin Stock'}
                </button>
            </div>

            <style>{`
                .card-carousel-arrow {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    background: rgba(255, 255, 255, 0.85);
                    border: none;
                    border-radius: 50%;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    transition: all 0.2s ease;
                    z-index: 2;
                    color: var(--text-primary);
                    opacity: 0;
                }
                .product-card-image:hover .card-carousel-arrow {
                    opacity: 1;
                }
                .card-carousel-arrow:hover {
                    background: white;
                    color: var(--accent);
                    transform: translateY(-50%) scale(1.1);
                }
                .card-carousel-arrow.left {
                    left: 8px;
                }
                .card-carousel-arrow.right {
                    right: 8px;
                }
                .card-carousel-arrow svg {
                    width: 20px;
                    height: 20px;
                }
                @media (max-width: 768px) {
                    .card-carousel-arrow {
                        opacity: 0.9;
                        width: 28px;
                        height: 28px;
                    }
                    .card-carousel-arrow svg {
                        width: 16px;
                        height: 16px;
                    }
                }
            `}</style>
        </div>
    );
}