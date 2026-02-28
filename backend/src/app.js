require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3001;

// Trust Proxy for Render & express-rate-limit
app.set('trust proxy', 1);

// Security Middleware
app.use(helmet());

// Cross-Origin Resource Sharing (CORS) Configuration
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Endpoint público para evitar sleep en Render (Cron Jobs / UptimeRobot)
app.get('/ping', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Backend activo' });
});

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later'
});
app.use(limiter);
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
