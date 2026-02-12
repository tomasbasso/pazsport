import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
    baseURL: API_URL,
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (window.location.pathname.startsWith('/admin')) {
                window.location.href = '/admin/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth
export const authAPI = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    getMe: () => api.get('/auth/me'),
};

// Categories
export const categoriesAPI = {
    getAll: () => api.get('/categories'),
    getById: (id) => api.get(`/categories/${id}`),
    create: (formData) => api.post('/categories', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    update: (id, formData) => api.put(`/categories/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    delete: (id) => api.delete(`/categories/${id}`),
};

// Products
export const productsAPI = {
    getAll: (params) => api.get('/products', { params }),
    getById: (id) => api.get(`/products/${id}`),
    create: (formData) => api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    update: (id, formData) => api.put(`/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    delete: (id) => api.delete(`/products/${id}`),
};

export default api;
