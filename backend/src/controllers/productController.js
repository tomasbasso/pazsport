const { sql, getPool } = require('../config/database');
const path = require('path');
const fs = require('fs');

// GET /api/products
async function getAll(req, res) {
    try {
        const { categoryId, active } = req.query;
        const pool = await getPool();
        const request = pool.request();

        let query = `
      SELECT p.*, c.name as categoryName 
      FROM Products p 
      LEFT JOIN Categories c ON p.categoryId = c.id
      WHERE 1=1
    `;

        if (categoryId) {
            query += ' AND p.categoryId = @categoryId';
            request.input('categoryId', sql.Int, categoryId);
        }

        if (active !== undefined) {
            query += ' AND p.isActive = @active';
            request.input('active', sql.Bit, active === 'true' ? 1 : 0);
        }

        query += ' ORDER BY p.createdAt DESC';

        const result = await request.query(query);

        // Parsear sizes de JSON string a array
        const products = result.recordset.map(p => ({
            ...p,
            sizes: p.sizes ? JSON.parse(p.sizes) : []
        }));

        res.json(products);
    } catch (err) {
        console.error('Error obteniendo productos:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

// GET /api/products/:id
async function getById(req, res) {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query(`
        SELECT p.*, c.name as categoryName 
        FROM Products p 
        LEFT JOIN Categories c ON p.categoryId = c.id
        WHERE p.id = @id
      `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        const product = result.recordset[0];
        product.sizes = product.sizes ? JSON.parse(product.sizes) : [];

        res.json(product);
    } catch (err) {
        console.error('Error obteniendo producto:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

// POST /api/products
async function create(req, res) {
    try {
        const { name, description, price, categoryId, sizes, stock, isActive } = req.body;
        const image = req.file ? `/uploads/${req.file.filename}` : null;

        if (!name || !price || !categoryId) {
            return res.status(400).json({ error: 'Nombre, precio y categoría son requeridos' });
        }

        const sizesJson = Array.isArray(sizes) ? JSON.stringify(sizes) : sizes || '[]';

        const pool = await getPool();
        const result = await pool.request()
            .input('name', sql.NVarChar, name)
            .input('description', sql.NVarChar, description || null)
            .input('price', sql.Decimal(10, 2), price)
            .input('image', sql.NVarChar, image)
            .input('categoryId', sql.Int, categoryId)
            .input('sizes', sql.NVarChar, sizesJson)
            .input('stock', sql.Int, stock || 0)
            .input('isActive', sql.Bit, isActive !== undefined ? isActive : 1)
            .query(`
        INSERT INTO Products (name, description, price, image, categoryId, sizes, stock, isActive)
        OUTPUT INSERTED.*
        VALUES (@name, @description, @price, @image, @categoryId, @sizes, @stock, @isActive)
      `);

        const product = result.recordset[0];
        product.sizes = product.sizes ? JSON.parse(product.sizes) : [];

        res.status(201).json(product);
    } catch (err) {
        console.error('Error creando producto:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

// PUT /api/products/:id
async function update(req, res) {
    try {
        const { name, description, price, categoryId, sizes, stock, isActive } = req.body;
        const image = req.file ? `/uploads/${req.file.filename}` : undefined;

        const pool = await getPool();

        // Si se sube nueva imagen, eliminar la vieja
        if (image) {
            const current = await pool.request()
                .input('id', sql.Int, req.params.id)
                .query('SELECT image FROM Products WHERE id = @id');

            if (current.recordset[0]?.image) {
                const oldPath = path.join(__dirname, '../../', current.recordset[0].image);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
        }

        let query = 'UPDATE Products SET updatedAt = GETDATE()';
        const request = pool.request().input('id', sql.Int, req.params.id);

        if (name !== undefined) {
            query += ', name = @name';
            request.input('name', sql.NVarChar, name);
        }
        if (description !== undefined) {
            query += ', description = @description';
            request.input('description', sql.NVarChar, description);
        }
        if (price !== undefined) {
            query += ', price = @price';
            request.input('price', sql.Decimal(10, 2), price);
        }
        if (image !== undefined) {
            query += ', image = @image';
            request.input('image', sql.NVarChar, image);
        }
        if (categoryId !== undefined) {
            query += ', categoryId = @categoryId';
            request.input('categoryId', sql.Int, categoryId);
        }
        if (sizes !== undefined) {
            const sizesJson = Array.isArray(sizes) ? JSON.stringify(sizes) : sizes;
            query += ', sizes = @sizes';
            request.input('sizes', sql.NVarChar, sizesJson);
        }
        if (stock !== undefined) {
            query += ', stock = @stock';
            request.input('stock', sql.Int, stock);
        }
        if (isActive !== undefined) {
            query += ', isActive = @isActive';
            request.input('isActive', sql.Bit, isActive);
        }

        query += ' OUTPUT INSERTED.* WHERE id = @id';

        const result = await request.query(query);

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        const product = result.recordset[0];
        product.sizes = product.sizes ? JSON.parse(product.sizes) : [];

        res.json(product);
    } catch (err) {
        console.error('Error actualizando producto:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

// DELETE /api/products/:id
async function remove(req, res) {
    try {
        const pool = await getPool();

        // Eliminar imagen si existe
        const current = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('SELECT image FROM Products WHERE id = @id');

        if (current.recordset[0]?.image) {
            const imgPath = path.join(__dirname, '../../', current.recordset[0].image);
            if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
        }

        const result = await pool.request()
            .input('id2', sql.Int, req.params.id)
            .query('DELETE FROM Products WHERE id = @id2');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json({ message: 'Producto eliminado correctamente' });
    } catch (err) {
        console.error('Error eliminando producto:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

module.exports = { getAll, getById, create, update, remove };
