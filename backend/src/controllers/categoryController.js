const { sql, getPool } = require('../config/database');
const path = require('path');
const fs = require('fs');

// GET /api/categories
async function getAll(req, res) {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .query('SELECT * FROM Categories ORDER BY name');
        res.json(result.recordset);
    } catch (err) {
        console.error('Error obteniendo categorías:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

// GET /api/categories/:id
async function getById(req, res) {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('SELECT * FROM Categories WHERE id = @id');

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }

        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Error obteniendo categoría:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

// POST /api/categories
async function create(req, res) {
    try {
        const { name, isActive } = req.body;
        const image = req.file ? `/uploads/${req.file.filename}` : null;

        if (!name) {
            return res.status(400).json({ error: 'El nombre es requerido' });
        }

        const pool = await getPool();
        const result = await pool.request()
            .input('name', sql.NVarChar, name)
            .input('image', sql.NVarChar, image)
            .input('isActive', sql.Bit, isActive !== undefined ? isActive : 1)
            .query(`
        INSERT INTO Categories (name, image, isActive)
        OUTPUT INSERTED.*
        VALUES (@name, @image, @isActive)
      `);

        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error('Error creando categoría:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

// PUT /api/categories/:id
async function update(req, res) {
    try {
        const { name, isActive } = req.body;
        const image = req.file ? `/uploads/${req.file.filename}` : undefined;

        const pool = await getPool();

        // Obtener categoría actual para eliminar imagen vieja si se sube nueva
        if (image) {
            const current = await pool.request()
                .input('id', sql.Int, req.params.id)
                .query('SELECT image FROM Categories WHERE id = @id');

            if (current.recordset[0]?.image) {
                const oldPath = path.join(__dirname, '../../', current.recordset[0].image);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
        }

        let query = 'UPDATE Categories SET updatedAt = GETDATE()';
        const request = pool.request().input('id', sql.Int, req.params.id);

        if (name !== undefined) {
            query += ', name = @name';
            request.input('name', sql.NVarChar, name);
        }
        if (image !== undefined) {
            query += ', image = @image';
            request.input('image', sql.NVarChar, image);
        }
        if (isActive !== undefined) {
            query += ', isActive = @isActive';
            request.input('isActive', sql.Bit, isActive);
        }

        query += ' OUTPUT INSERTED.* WHERE id = @id';

        const result = await request.query(query);

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }

        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Error actualizando categoría:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

// DELETE /api/categories/:id
async function remove(req, res) {
    try {
        const pool = await getPool();

        // Verificar si tiene productos asociados
        const products = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('SELECT COUNT(*) as count FROM Products WHERE categoryId = @id');

        if (products.recordset[0].count > 0) {
            return res.status(400).json({
                error: 'No se puede eliminar. La categoría tiene productos asociados.'
            });
        }

        // Eliminar imagen si existe
        const current = await pool.request()
            .input('id2', sql.Int, req.params.id)
            .query('SELECT image FROM Categories WHERE id = @id2');

        if (current.recordset[0]?.image) {
            const imgPath = path.join(__dirname, '../../', current.recordset[0].image);
            if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
        }

        const result = await pool.request()
            .input('id3', sql.Int, req.params.id)
            .query('DELETE FROM Categories WHERE id = @id3');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }

        res.json({ message: 'Categoría eliminada correctamente' });
    } catch (err) {
        console.error('Error eliminando categoría:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

module.exports = { getAll, getById, create, update, remove };
