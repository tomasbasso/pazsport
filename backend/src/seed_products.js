const db = require('./config/database');

async function seedProducts() {
    try {
        console.log('🌱 Sembrando datos en Supabase...');

        // 1. Categorías
        const categories = [
            'Remeras', 'Pantalones', 'Conjuntos', 'Buzos', 'Shorts', 'Accesorios'
        ];

        for (const catName of categories) {
            // Check if exists
            const res = await db.query('SELECT id FROM "Categories" WHERE name = $1', [catName]);
            if (res.rows.length === 0) {
                await db.query(
                    'INSERT INTO "Categories" (name, "isActive") VALUES ($1, true)',
                    [catName]
                );
            }
        }
        console.log('✅ Categorías verificadas/insertadas.');

        // 2. Obtener IDs de categorías
        const catMap = {};
        const catRes = await db.query('SELECT id, name FROM "Categories"');
        catRes.rows.forEach(r => catMap[r.name] = r.id);

        // 3. Productos de Ejemplo con Colores
        const products = [
            {
                name: 'Remera Training Dry-Fit',
                price: 12500,
                cat: 'Remeras',
                colors: ['#000000', '#FFFFFF', '#FF0000'], // Negro, Blanco, Rojo
                sizes: ['S', 'M', 'L', 'XL']
            },
            {
                name: 'Remera Oversize Sport',
                price: 10800,
                cat: 'Remeras',
                colors: ['#000080', '#808080'], // Azul Marino, Gris
                sizes: ['S', 'M', 'L', 'XL', 'XXL']
            },
            {
                name: 'Jogger Deportivo',
                price: 18500,
                cat: 'Pantalones',
                colors: ['#000000', '#333333'], // Negro, Gris Oscuro
                sizes: ['S', 'M', 'L', 'XL']
            },
            {
                name: 'Buzo Hoodie Premium',
                price: 21000,
                cat: 'Buzos',
                colors: ['#F5F5DC', '#000000'], // Beige, Negro
                sizes: ['S', 'M', 'L', 'XL']
            },
            {
                name: 'Short Running',
                price: 13000,
                cat: 'Shorts',
                colors: ['#000000', '#0000FF'], // Negro, Azul
                sizes: ['S', 'M', 'L']
            },
            {
                name: 'Gorra PazSport',
                price: 8500,
                cat: 'Accesorios',
                colors: ['#000000', '#FFFFFF'],
                sizes: ['Único']
            }
        ];

        for (const p of products) {
            if (!catMap[p.cat]) {
                console.log(`⚠️ Categoría no encontrada para ${p.name}: ${p.cat}`);
                continue;
            }

            // Check existence check by name
            const exist = await db.query(`SELECT id FROM "Products" WHERE name = $1`, [p.name]);

            if (exist.rows.length === 0) {
                await db.query(
                    `INSERT INTO "Products" (name, description, price, "categoryId", sizes, colors, stock, "isActive")
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                    [
                        p.name,
                        'Producto de alta calidad PazSport',
                        p.price,
                        catMap[p.cat],
                        JSON.stringify(p.sizes),
                        JSON.stringify(p.colors),
                        50,
                        true
                    ]
                );
                console.log(`   + Creado: ${p.name}`);
            } else {
                // Update properties if needed, specifically colors as they are new
                await db.query(
                    `UPDATE "Products" 
                     SET colors = $1, sizes = $2, "categoryId" = $3, price = $4, "isActive" = true
                     WHERE id = $5`,
                    [
                        JSON.stringify(p.colors),
                        JSON.stringify(p.sizes),
                        catMap[p.cat],
                        p.price,
                        exist.rows[0].id
                    ]
                );
                console.log(`   ~ Actualizado: ${p.name}`);
            }
        }

        console.log('✅ Base de datos poblada exitosamente.');
        process.exit(0);

    } catch (err) {
        console.error('❌ Error sembrando productos:', err);
        process.exit(1);
    }
}

seedProducts();
