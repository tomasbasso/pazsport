import { useState, useEffect } from 'react';
import { FiArrowDown } from 'react-icons/fi';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import { categoriesAPI, productsAPI } from '../services/api';

export default function Home() {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        loadProducts();
    }, [selectedCategory]);

    async function loadData() {
        try {
            const [catRes, prodRes] = await Promise.all([
                categoriesAPI.getAll(),
                productsAPI.getAll({ active: 'true' }),
            ]);
            setCategories(catRes.data);
            setProducts(prodRes.data);
        } catch (err) {
            console.error('Error cargando datos:', err);
        } finally {
            setLoading(false);
        }
    }

    async function loadProducts() {
        try {
            const params = { active: 'true' };
            if (selectedCategory) params.categoryId = selectedCategory;
            const { data } = await productsAPI.getAll(params);
            setProducts(data);
        } catch (err) {
            console.error('Error cargando productos:', err);
        }
    }

    return (
        <>
            {/* Hero */}
            <section className="hero">
                <h1>Tu Estilo Deportivo</h1>
                <p>Indumentaria deportiva premium para todos. Estilo y comodidad en cada entrenamiento.</p>
                <a href="#catalogo" className="hero-btn">
                    Ver Catálogo <FiArrowDown />
                </a>
            </section>

            {/* Categories */}
            <section className="categories-section" id="catalogo">
                <div className="categories-bar">
                    <button
                        className={`category-pill ${!selectedCategory ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(null)}
                    >
                        Todos
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            className={`category-pill ${selectedCategory === cat.id ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(cat.id)}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </section>

            {/* Products Grid */}
            <section className="products-section">
                <h2>
                    {selectedCategory
                        ? categories.find(c => c.id === selectedCategory)?.name || 'Productos'
                        : 'Todos los Productos'}
                </h2>
                {loading ? (
                    <div className="loading-spinner"><div className="spinner"></div></div>
                ) : products.length === 0 ? (
                    <div className="products-empty">
                        <div className="products-empty-icon">📦</div>
                        <p>No hay productos disponibles en esta categoría</p>
                    </div>
                ) : (
                    <div className="products-grid">
                        {products.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </section>

            <Footer />
        </>
    );
}
