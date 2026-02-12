const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

// Rutas públicas
router.get('/', categoryController.getAll);
router.get('/:id', categoryController.getById);

// Rutas protegidas (admin)
router.post('/', authMiddleware, upload.single('image'), categoryController.create);
router.put('/:id', authMiddleware, upload.single('image'), categoryController.update);
router.delete('/:id', authMiddleware, categoryController.remove);

module.exports = router;
