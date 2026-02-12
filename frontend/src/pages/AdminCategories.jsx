import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import { categoriesAPI } from '../services/api';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

export default function AdminCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', isActive: true });
    const [imageFile, setImageFile] = useState(null);

    useEffect(() => { loadData(); }, []);

    async function loadData() {
        try {
            const { data } = await categoriesAPI.getAll();
            setCategories(data);
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    }

    function openCreate() {
        setEditing(null);
        setForm({ name: '', isActive: true });
        setImageFile(null);
        setShowModal(true);
    }

    function openEdit(cat) {
        setEditing(cat);
        setForm({ name: cat.name, isActive: cat.isActive });
        setImageFile(null);
        setShowModal(true);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('isActive', form.isActive);
        if (imageFile) formData.append('image', imageFile);

        try {
            if (editing) {
                await categoriesAPI.update(editing.id, formData);
            } else {
                await categoriesAPI.create(formData);
            }
            setShowModal(false);
            loadData();
        } catch (err) {
            alert('Error: ' + (err.response?.data?.error || err.message));
        }
    }

    async function handleDelete(id) {
        if (!window.confirm('¿Estás seguro de eliminar esta categoría?')) return;
        try {
            await categoriesAPI.delete(id);
            loadData();
        } catch (err) {
            alert('Error: ' + (err.response?.data?.error || err.message));
        }
    }

    if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

    return (
        <>
            <div className="admin-header">
                <h1>Gestión de Categorías</h1>
                <button className="admin-btn admin-btn-primary" onClick={openCreate}>
                    <FiPlus /> Nueva Categoría
                </button>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Imagen</th><th>Nombre</th><th>Estado</th><th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map(c => (
                            <tr key={c.id}>
                                <td>
                                    {c.image ? (
                                        <img src={c.image.startsWith('data:') || c.image.startsWith('http') ? c.image : `${API_BASE}${c.image}`} alt={c.name} className="admin-table-img" />
                                    ) : (
                                        <div className="admin-table-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🏷️</div>
                                    )}
                                </td>
                                <td><strong>{c.name}</strong></td>
                                <td>
                                    <span className={`badge ${c.isActive ? 'badge-active' : 'badge-inactive'}`}>
                                        {c.isActive ? 'Activa' : 'Inactiva'}
                                    </span>
                                </td>
                                <td>
                                    <div className="admin-actions">
                                        <button className="admin-action-btn" onClick={() => openEdit(c)} title="Editar"><FiEdit2 /></button>
                                        <button className="admin-action-btn delete" onClick={() => handleDelete(c.id)} title="Eliminar"><FiTrash2 /></button>
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
                            <h2>{editing ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
                            <button className="cart-close" onClick={() => setShowModal(false)}><FiX /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Nombre *</label>
                                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Imagen</label>
                                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />
                                    Categoría activa
                                </label>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                                <button type="submit" className="admin-btn admin-btn-primary">
                                    {editing ? 'Guardar Cambios' : 'Crear Categoría'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
