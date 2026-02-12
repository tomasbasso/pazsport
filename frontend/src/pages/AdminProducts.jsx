import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import { productsAPI, categoriesAPI } from '../services/api';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

export default function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', description: '', price: '', categoryId: '', sizes: '', stock: '', isActive: true });
    const [imageFile, setImageFile] = useState(null);

    useEffect(() => { loadData(); }, []);

    async function loadData() {
        try {
            const [prodRes, catRes] = await Promise.all([
                productsAPI.getAll(),
                categoriesAPI.getAll(),
            ]);
            setProducts(prodRes.data);
            setCategories(catRes.data);
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    }

    function openCreate() {
        setEditing(null);
        setForm({ name: '', description: '', price: '', categoryId: categories[0]?.id || '', sizes: 'S,M,L,XL', stock: '0', isActive: true });
        setImageFile(null);
        setShowModal(true);
    }

    function openEdit(product) {
        setEditing(product);
        setForm({
            name: product.name,
            description: product.description || '',
            price: product.price.toString(),
            categoryId: product.categoryId.toString(),
            sizes: product.sizes?.join(',') || '',
            stock: product.stock.toString(),
            isActive: product.isActive,
        });
        setImageFile(null);
        setShowModal(true);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('description', form.description);
        formData.append('price', form.price);
        formData.append('categoryId', form.categoryId);
        formData.append('sizes', JSON.stringify(form.sizes.split(',').map(s => s.trim()).filter(Boolean)));
        formData.append('stock', form.stock);
        formData.append('isActive', form.isActive);
        if (imageFile) formData.append('image', imageFile);

        try {
            if (editing) {
                await productsAPI.update(editing.id, formData);
            } else {
                await productsAPI.create(formData);
            }
            setShowModal(false);
            loadData();
        } catch (err) {
            alert('Error: ' + (err.response?.data?.error || err.message));
        }
    }

    async function handleDelete(id) {
        if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;
        try {
            await productsAPI.delete(id);
            loadData();
        } catch (err) {
            alert('Error: ' + (err.response?.data?.error || err.message));
        }
    }

    if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

    return (
        <>
            <div className="admin-header">
                <h1>Gestión de Productos</h1>
                <button className="admin-btn admin-btn-primary" onClick={openCreate}>
                    <FiPlus /> Nuevo Producto
                </button>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Imagen</th><th>Nombre</th><th>Categoría</th>
                            <th>Precio</th><th>Talles</th><th>Stock</th>
                            <th>Estado</th><th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(p => (
                            <tr key={p.id}>
                                <td>
                                    {p.image ? (
                                        <img src={`${API_BASE}${p.image}`} alt={p.name} className="admin-table-img" />
                                    ) : (
                                        <div className="admin-table-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🏃</div>
                                    )}
                                </td>
                                <td><strong>{p.name}</strong></td>
                                <td>{p.categoryName || '-'}</td>
                                <td>${p.price?.toLocaleString('es-AR')}</td>
                                <td>{p.sizes?.join(', ') || '-'}</td>
                                <td>{p.stock}</td>
                                <td>
                                    <span className={`badge ${p.isActive ? 'badge-active' : 'badge-inactive'}`}>
                                        {p.isActive ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td>
                                    <div className="admin-actions">
                                        <button className="admin-action-btn" onClick={() => openEdit(p)} title="Editar"><FiEdit2 /></button>
                                        <button className="admin-action-btn delete" onClick={() => handleDelete(p.id)} title="Eliminar"><FiTrash2 /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2>{editing ? 'Editar Producto' : 'Nuevo Producto'}</h2>
                            <button className="cart-close" onClick={() => setShowModal(false)}><FiX /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Nombre *</label>
                                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Descripción</label>
                                <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Precio *</label>
                                    <input type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label>Stock</label>
                                    <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Categoría *</label>
                                <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} required
                                    style={{ width: '100%', padding: '12px', border: '2px solid var(--border)', borderRadius: '8px', fontSize: '0.95rem' }}>
                                    <option value="">Seleccionar...</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Talles (separados por coma)</label>
                                <input value={form.sizes} onChange={e => setForm({ ...form, sizes: e.target.value })} placeholder="S,M,L,XL" />
                            </div>
                            <div className="form-group">
                                <label>Imagen</label>
                                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />
                                    Producto activo
                                </label>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                                <button type="submit" className="admin-btn admin-btn-primary">
                                    {editing ? 'Guardar Cambios' : 'Crear Producto'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
