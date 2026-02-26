const db = require('../config/database');
const { uploadImage, deleteImage } = require('../config/supabase');

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

        if (!name) {
            return res.status(400).json({ error: 'El nombre es requerido' });
        }

        // Insertar primero para obtener el ID
        const insertQuery = `
            INSERT INTO "Categories" (name, image, "isActive")
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const result = await db.query(insertQuery, [name, null, isActive !== undefined ? isActive : true]);
        const category = result.rows[0];

        // Subir imagen a Storage si existe
        if (req.file) {
            const imageUrl = await uploadImage(req.file.buffer, req.file.mimetype, 'categories', category.id);
            if (imageUrl) {
                await db.query('UPDATE "Categories" SET image = $1 WHERE id = $2', [imageUrl, category.id]);
                category.image = imageUrl;
            }
        }

        res.status(201).json(category);
    } catch (err) {
        console.error('Error creando categoría:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

// PUT /api/categories/:id
async function update(req, res) {
    try {
        const { name, isActive } = req.body;

        let query = 'UPDATE "Categories" SET "updatedAt" = NOW()';
        const params = [req.params.id];
        let paramIndex = 2;

        if (name !== undefined) {
            query += `, name = $${paramIndex++}`;
            params.push(name);
        }
        if (isActive !== undefined) {
            query += `, "isActive" = $${paramIndex++}`;
            params.push(isActive);
        }

        // Subir nueva imagen a Storage si viene en la request
        if (req.file) {
            const existing = await db.query('SELECT image FROM "Categories" WHERE id = $1', [req.params.id]);
            if (existing.rows[0]?.image) {
                await deleteImage(existing.rows[0].image);
            }

            const imageUrl = await uploadImage(req.file.buffer, req.file.mimetype, 'categories', req.params.id);
            if (imageUrl) {
                query += `, image = $${paramIndex++}`;
                params.push(imageUrl);
            }
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
        const productsResult = await db.query('SELECT COUNT(*) as count FROM "Products" WHERE "categoryId" = $1', [req.params.id]);

        if (parseInt(productsResult.rows[0].count) > 0) {
            return res.status(400).json({
                error: 'No se puede eliminar. La categoría tiene productos asociados.'
            });
        }

        // Eliminar imagen de Storage antes de borrar
        const existing = await db.query('SELECT image FROM "Categories" WHERE id = $1', [req.params.id]);
        if (existing.rows[0]?.image) {
            await deleteImage(existing.rows[0].image);
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
