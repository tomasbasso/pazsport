const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

// Rutas públicas
router.get('/', productController.getAll);
router.get('/:id', productController.getById);

// Rutas protegidas (admin)
router.post('/', authMiddleware, upload.array('images', 5), productController.create);
router.put('/:id', authMiddleware, upload.array('images', 5), productController.update);
router.delete('/:id', authMiddleware, productController.remove);

module.exports = router;