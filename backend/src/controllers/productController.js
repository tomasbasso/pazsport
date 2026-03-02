const db = require('../config/database');
const { uploadImage, deleteImage } = require('../config/supabase');

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

        const products = result.rows.map(p => {
            let images = [];
            if (p.images && p.images.length > 0) {
                images = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
            } else if (p.image) {
                images = [p.image];
            }

            return {
                ...p,
                images,
                sizes: p.sizes ? JSON.parse(p.sizes) : [],
                colors: p.colors ? JSON.parse(p.colors) : []
            };
        });

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

        let images = [];
        if (product.images && product.images.length > 0) {
            images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
        } else if (product.image) {
            images = [product.image];
        }
        product.images = images;

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

        if (!name || !price || !categoryId) {
            return res.status(400).json({ error: 'Nombre, precio y categoría son requeridos' });
        }

        let images = [];

        // Insertar primero para obtener el ID (necesario para el nombre del archivo en Storage)
        const sizesJson = Array.isArray(sizes) ? JSON.stringify(sizes) : sizes || '[]';
        const colorsJson = Array.isArray(colors) ? JSON.stringify(colors) : colors || '[]';

        const insertQuery = `
            INSERT INTO "Products" (name, description, price, image, images, "categoryId", sizes, colors, stock, "isActive")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `;
        const insertValues = [
            name,
            description || null,
            price,
            null, // imagen simple descontinuada
            JSON.stringify([]), // images array temporal
            categoryId,
            sizesJson,
            colorsJson,
            stock || 0,
            isActive !== undefined ? isActive : true
        ];

        const result = await db.query(insertQuery, insertValues);
        const product = result.rows[0];

        // Ahora subir imágenes a Storage si existen
        if (req.files && req.files.length > 0) {
            const uploadPromises = req.files.map(file =>
                uploadImage(file.buffer, file.mimetype, 'products', product.id)
            );

            const uploadedUrls = await Promise.all(uploadPromises);
            // Filtramos urls nulas por si alguna falló
            images = uploadedUrls.filter(url => url !== null);

            if (images.length > 0) {
                await db.query('UPDATE "Products" SET images = $1 WHERE id = $2', [JSON.stringify(images), product.id]);
                product.images = images;
            }
        }

        product.sizes = product.sizes ? JSON.parse(product.sizes) : [];
        product.colors = product.colors ? JSON.parse(product.colors) : [];
        product.images = images;

        res.status(201).json(product);
    } catch (err) {
        console.error('Error creando producto:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

// PUT /api/products/:id
async function update(req, res) {
    try {
        const { name, description, price, categoryId, sizes, colors, stock, isActive, existingImages } = req.body;

        let query = 'UPDATE "Products" SET "updatedAt" = NOW()';
        const params = [req.params.id]; // $1 es el ID
        let paramIndex = 2;

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

        // --- MANEJO DE IMÁGENES MÚLTIPLES ---

        // 1. Obtener las imágenes actuales de la BD
        const existingRow = await db.query('SELECT image, images FROM "Products" WHERE id = $1', [req.params.id]);

        if (existingRow.rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        const row = existingRow.rows[0];
        let currentImagesUrls = [];

        if (row.images && row.images.length > 0) {
            currentImagesUrls = typeof row.images === 'string' ? JSON.parse(row.images) : row.images;
        } else if (row.image) {
            currentImagesUrls = [row.image];
        }

        // 2. Determinar cuáles de las actuales el usuario decidió mantener
        let keptImages = [];
        if (existingImages) {
            try {
                keptImages = JSON.parse(existingImages);
            } catch (e) {
                keptImages = Array.isArray(existingImages) ? existingImages : [existingImages];
            }
        }

        // 3. Eliminar de Storage las que el usuario quitó
        const imagesToDelete = currentImagesUrls.filter(url => !keptImages.includes(url));
        if (imagesToDelete.length > 0) {
            for (const imageUrl of imagesToDelete) {
                await deleteImage(imageUrl);
            }
        }

        let finalImages = [...keptImages];

        // 4. Subir las nuevas imágenes
        if (req.files && req.files.length > 0) {
            const uploadPromises = req.files.map(file =>
                uploadImage(file.buffer, file.mimetype, 'products', req.params.id)
            );
            const newUploadedUrls = await Promise.all(uploadPromises);
            const validNewUrls = newUploadedUrls.filter(url => url !== null);
            finalImages = [...finalImages, ...validNewUrls];
        }

        // Añadir array final al query
        query += `, images = $${paramIndex++}`;
        params.push(JSON.stringify(finalImages));

        query += ' WHERE id = $1 RETURNING *';

        const result = await db.query(query, params);

        const product = result.rows[0];

        product.images = finalImages;
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
        // Eliminar todas las imágenes de Storage antes de borrar el registro
        const existing = await db.query('SELECT image, images FROM "Products" WHERE id = $1', [req.params.id]);
        if (existing.rows.length > 0) {
            const row = existing.rows[0];
            let imagesToDelete = [];

            if (row.images && row.images.length > 0) {
                imagesToDelete = typeof row.images === 'string' ? JSON.parse(row.images) : row.images;
            } else if (row.image) {
                imagesToDelete = [row.image];
            }

            for (const imageUrl of imagesToDelete) {
                await deleteImage(imageUrl);
            }
        }

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