require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (imágenes subidas)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const productRoutes = require('./routes/products');

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);

// Ruta de health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'PazSport API funcionando correctamente',
        timestamp: new Date().toISOString()
    });
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error('Error:', err);

    if (err.name === 'MulterError') {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'El archivo es muy grande. Máximo 5MB.' });
        }
        return res.status(400).json({ error: err.message });
    }

    res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar servidor
function start() {
    try {
        app.listen(PORT, () => {
            console.log(`🚀 PazSport API corriendo en http://localhost:${PORT}`);
            console.log(`📦 Endpoints disponibles:`);
            console.log(`   GET  /api/health`);
            console.log(`   POST /api/auth/login`);
            console.log(`   GET  /api/categories`);
            console.log(`   GET  /api/products`);
        });
    } catch (err) {
        console.error('❌ Error iniciando el servidor:', err);
        process.exit(1);
    }
}

start();
