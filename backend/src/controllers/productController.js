const db = require('../config/database');
const path = require('path');
const fs = require('fs');

// GET /api/products
async function getAll(req, res) {
    try {
        const { categoryId, active } = req.query;
        let query = `
            SELECT p.*, c.name as "categoryName" 
            FROM "Products" p 
            LEFT JOIN "Categories" c ON p."categoryId" = c.id
            WHERE 1=1
        `;
        const params = [];

        if (categoryId) {
            params.push(categoryId);
            query += ` AND p."categoryId" = $${params.length}`;
        }

        if (active !== undefined) {
            params.push(active === 'true');
            query += ` AND p."isActive" = $${params.length}`;
        }

        query += ' ORDER BY p."createdAt" DESC';

        const result = await db.query(query, params);

        // Parsear sizes y colors de JSON string a array
        const products = result.rows.map(p => ({
            ...p,
            sizes: p.sizes ? JSON.parse(p.sizes) : [],
            colors: p.colors ? JSON.parse(p.colors) : []
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
        const query = `
            SELECT p.*, c.name as "categoryName" 
            FROM "Products" p 
            LEFT JOIN "Categories" c ON p."categoryId" = c.id
            WHERE p.id = $1
        `;
        const result = await db.query(query, [req.params.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        const product = result.rows[0];
        product.sizes = product.sizes ? JSON.parse(product.sizes) : [];
        product.colors = product.colors ? JSON.parse(product.colors) : [];

        res.json(product);
    } catch (err) {
        console.error('Error obteniendo producto:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

// POST /api/products
async function create(req, res) {
    try {
        const { name, description, price, categoryId, sizes, colors, stock, isActive } = req.body;

        // Convertir imagen a Base64 para persistencia en DB
        let image = null;
        if (req.file) {
            const b64 = req.file.buffer.toString('base64');
            image = `data:${req.file.mimetype};base64,${b64}`;
        }

        if (!name || !price || !categoryId) {
            return res.status(400).json({ error: 'Nombre, precio y categoría son requeridos' });
        }

        const sizesJson = Array.isArray(sizes) ? JSON.stringify(sizes) : sizes || '[]';
        const colorsJson = Array.isArray(colors) ? JSON.stringify(colors) : colors || '[]';

        const query = `
            INSERT INTO "Products" (name, description, price, image, "categoryId", sizes, colors, stock, "isActive")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `;
        const values = [
            name,
            description || null,
            price,
            image,
            categoryId,
            sizesJson,
            colorsJson,
            stock || 0,
            isActive !== undefined ? isActive : true
        ];

        const result = await db.query(query, values);
        const product = result.rows[0];
        product.sizes = product.sizes ? JSON.parse(product.sizes) : [];
        product.colors = product.colors ? JSON.parse(product.colors) : [];

        res.status(201).json(product);
    } catch (err) {
        console.error('Error creando producto:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

// PUT /api/products/:id
async function update(req, res) {
    try {
        const { name, description, price, categoryId, sizes, colors, stock, isActive } = req.body;

        let image = undefined;
        if (req.file) {
            const b64 = req.file.buffer.toString('base64');
            image = `data:${req.file.mimetype};base64,${b64}`;
        }

        let query = 'UPDATE "Products" SET "updatedAt" = NOW()';
        const params = [req.params.id]; // $1 es el ID
        let paramIndex = 2; // Empezamos desde $2

        if (name !== undefined) {
            query += `, name = $${paramIndex++}`;
            params.push(name);
        }
        if (description !== undefined) {
            query += `, description = $${paramIndex++}`;
            params.push(description);
        }
        if (price !== undefined) {
            query += `, price = $${paramIndex++}`;
            params.push(price);
        }
        if (image !== undefined) {
            query += `, image = $${paramIndex++}`;
            params.push(image);
        }
        if (categoryId !== undefined) {
            query += `, "categoryId" = $${paramIndex++}`;
            params.push(categoryId);
        }
        if (sizes !== undefined) {
            const sizesJson = Array.isArray(sizes) ? JSON.stringify(sizes) : sizes;
            query += `, sizes = $${paramIndex++}`;
            params.push(sizesJson);
        }
        if (colors !== undefined) {
            const colorsJson = Array.isArray(colors) ? JSON.stringify(colors) : colors;
            query += `, colors = $${paramIndex++}`;
            params.push(colorsJson);
        }
        if (stock !== undefined) {
            query += `, stock = $${paramIndex++}`;
            params.push(stock);
        }
        if (isActive !== undefined) {
            query += `, "isActive" = $${paramIndex++}`;
            params.push(isActive);
        }

        query += ' WHERE id = $1 RETURNING *';

        const result = await db.query(query, params);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        const product = result.rows[0];
        product.sizes = product.sizes ? JSON.parse(product.sizes) : [];
        product.colors = product.colors ? JSON.parse(product.colors) : [];

        res.json(product);
    } catch (err) {
        console.error('Error actualizando producto:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

// DELETE /api/products/:id
async function remove(req, res) {
    try {
        const result = await db.query('DELETE FROM "Products" WHERE id = $1', [req.params.id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json({ message: 'Producto eliminado correctamente' });
    } catch (err) {
        console.error('Error eliminando producto:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

module.exports = { getAll, getById, create, update, remove };
