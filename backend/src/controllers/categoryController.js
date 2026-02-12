const db = require('../config/database');
const path = require('path');
const fs = require('fs');

// GET /api/categories
async function getAll(req, res) {
    try {
        const result = await db.query('SELECT * FROM "Categories" ORDER BY name');
        res.json(result.rows);
    } catch (err) {
        console.error('Error obteniendo categorías:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

// GET /api/categories/:id
async function getById(req, res) {
    try {
        const result = await db.query('SELECT * FROM "Categories" WHERE id = $1', [req.params.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error obteniendo categoría:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

// POST /api/categories
async function create(req, res) {
    try {
        const { name, isActive } = req.body;

        let image = null;
        if (req.file) {
            const b64 = req.file.buffer.toString('base64');
            image = `data:${req.file.mimetype};base64,${b64}`;
        }

        if (!name) {
            return res.status(400).json({ error: 'El nombre es requerido' });
        }

        const query = `
            INSERT INTO "Categories" (name, image, "isActive")
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const values = [name, image, isActive !== undefined ? isActive : true];

        const result = await db.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creando categoría:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

// PUT /api/categories/:id
async function update(req, res) {
    try {
        const { name, isActive } = req.body;

        let image = undefined;
        if (req.file) {
            const b64 = req.file.buffer.toString('base64');
            image = `data:${req.file.mimetype};base64,${b64}`;
        }

        let query = 'UPDATE "Categories" SET "updatedAt" = NOW()';
        const params = [req.params.id];
        let paramIndex = 2;

        if (name !== undefined) {
            query += `, name = $${paramIndex++}`;
            params.push(name);
        }
        if (image !== undefined) {
            query += `, image = $${paramIndex++}`;
            params.push(image);
        }
        if (isActive !== undefined) {
            query += `, "isActive" = $${paramIndex++}`;
            params.push(isActive);
        }

        query += ' WHERE id = $1 RETURNING *';

        const result = await db.query(query, params);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error actualizando categoría:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

// DELETE /api/categories/:id
async function remove(req, res) {
    try {
        // Verificar si tiene productos asociados
        const productsResult = await db.query('SELECT COUNT(*) as count FROM "Products" WHERE "categoryId" = $1', [req.params.id]);

        if (parseInt(productsResult.rows[0].count) > 0) {
            return res.status(400).json({
                error: 'No se puede eliminar. La categoría tiene productos asociados.'
            });
        }

        const result = await db.query('DELETE FROM "Categories" WHERE id = $1', [req.params.id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }

        res.json({ message: 'Categoría eliminada correctamente' });
    } catch (err) {
        console.error('Error eliminando categoría:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

module.exports = { getAll, getById, create, update, remove };
