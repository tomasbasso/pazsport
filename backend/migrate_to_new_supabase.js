/**
 * PazSport - Script de Migración de Datos
 * =========================================
 * Lee todos los datos de la DB original (Account 1)
 * y los replica en el nuevo Supabase (Account 2),
 * subiendo las imágenes Base64 a Supabase Storage.
 *
 * USO:
 *   1. Completar SUPABASE_SERVICE_KEY abajo
 *   2. cd backend
 *   3. node migrate_to_new_supabase.js
 */

const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');

// ─── CONFIG ────────────────────────────────────────────────────────────────

// DB ORIGINAL (cuenta vieja - solo lectura, NO se modifica)
const OLD_DB_URL = 'postgresql://postgres.zkwawelahetfltmtlzqs:Lasegunda-548@aws-1-us-east-1.pooler.supabase.com:6543/postgres';

// NUEVO SUPABASE (cuenta nueva)
const NEW_SUPABASE_URL = 'https://bxrodymbbqzzlhtfamuy.supabase.co';
const NEW_SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4cm9keW1iYnF6emxodGZhbXV5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjExNjE0MCwiZXhwIjoyMDg3NjkyMTQwfQ.j2ycDUa9JT0jejLReL8ndJXoCpFUpimMS5Ci5XTSMsQ';

const STORAGE_BUCKET = 'product-images';

// ─── CLIENTES ──────────────────────────────────────────────────────────────

const oldPool = new Pool({ connectionString: OLD_DB_URL });
const newSupabase = createClient(NEW_SUPABASE_URL, NEW_SUPABASE_SERVICE_KEY);

// ─── HELPERS ───────────────────────────────────────────────────────────────

/**
 * Sube una imagen Base64 a Supabase Storage.
 * Retorna la URL pública, o null si no hay imagen.
 */
async function uploadBase64Image(base64String, filename) {
    if (!base64String) return null;

    // Verificar si ya es una URL (para evitar doble procesamiento)
    if (base64String.startsWith('http')) return base64String;

    // Parsear el string Base64: "data:image/jpeg;base64,/9j/..."
    const match = base64String.match(/^data:(.+);base64,(.+)$/);
    if (!match) {
        console.warn(`  ⚠️  Formato de imagen inválido para: ${filename}`);
        return null;
    }

    const mimeType = match[1];
    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, 'base64');

    const ext = mimeType.split('/')[1] || 'jpg';
    const storagePath = `${filename}.${ext}`;

    const { data, error } = await newSupabase.storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, buffer, {
            contentType: mimeType,
            upsert: true
        });

    if (error) {
        console.error(`  ❌ Error subiendo imagen ${filename}:`, error.message);
        return null;
    }

    // Obtener URL pública
    const { data: publicData } = newSupabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(storagePath);

    return publicData.publicUrl;
}

// ─── MIGRACIÓN ─────────────────────────────────────────────────────────────

async function migrateCategories() {
    console.log('\n📂 Migrando Categorías...');
    const { rows } = await oldPool.query('SELECT * FROM "Categories" ORDER BY id');
    console.log(`  Encontradas: ${rows.length} categorías`);

    for (const cat of rows) {
        console.log(`  → Procesando: ${cat.name}`);

        // Subir imagen si existe
        const imageUrl = await uploadBase64Image(cat.image, `category_${cat.id}`);

        const { error } = await newSupabase
            .from('Categories')
            .upsert({
                id: cat.id,
                name: cat.name,
                image: imageUrl,
                isActive: cat.isActive,
                createdAt: cat.createdAt,
                updatedAt: cat.updatedAt
            }, { onConflict: 'id' });

        if (error) {
            console.error(`  ❌ Error insertando categoría ${cat.name}:`, error.message);
        } else {
            console.log(`  ✅ ${cat.name} migrada${imageUrl ? ' (con imagen)' : ' (sin imagen)'}`);
        }
    }
}

async function migrateProducts() {
    console.log('\n📦 Migrando Productos...');
    const { rows } = await oldPool.query('SELECT * FROM "Products" ORDER BY id');
    console.log(`  Encontrados: ${rows.length} productos`);

    for (const prod of rows) {
        console.log(`  → Procesando: ${prod.name}`);

        // Subir imagen si existe
        const imageUrl = await uploadBase64Image(prod.image, `product_${prod.id}`);

        const { error } = await newSupabase
            .from('Products')
            .upsert({
                id: prod.id,
                name: prod.name,
                description: prod.description,
                price: prod.price,
                image: imageUrl,
                categoryId: prod.categoryId,
                sizes: prod.sizes,
                colors: prod.colors,
                stock: prod.stock,
                isActive: prod.isActive,
                createdAt: prod.createdAt,
                updatedAt: prod.updatedAt
            }, { onConflict: 'id' });

        if (error) {
            console.error(`  ❌ Error insertando producto ${prod.name}:`, error.message);
        } else {
            console.log(`  ✅ ${prod.name} migrado${imageUrl ? ' (con imagen en Storage)' : ' (sin imagen)'}`);
        }
    }
}

async function migrateUsers() {
    console.log('\n👤 Migrando Usuarios...');
    const { rows } = await oldPool.query('SELECT * FROM "Users" ORDER BY id');
    console.log(`  Encontrados: ${rows.length} usuarios`);

    for (const user of rows) {
        const { error } = await newSupabase
            .from('Users')
            .upsert({
                id: user.id,
                email: user.email,
                password: user.password,  // Ya está hasheado con bcrypt
                name: user.name,
                role: user.role,
                createdAt: user.createdAt
            }, { onConflict: 'id' });

        if (error) {
            console.error(`  ❌ Error insertando usuario ${user.email}:`, error.message);
        } else {
            console.log(`  ✅ ${user.email} migrado`);
        }
    }
}

async function fixSequences() {
    console.log('\n🔧 Corrigiendo secuencias de auto-increment...');
    // Después de insertar con IDs específicos, hay que actualizar las secuencias
    // para que el próximo INSERT use el ID correcto
    const { data: cats } = await newSupabase.from('Categories').select('id').order('id', { ascending: false }).limit(1);
    const { data: prods } = await newSupabase.from('Products').select('id').order('id', { ascending: false }).limit(1);
    const { data: users } = await newSupabase.from('Users').select('id').order('id', { ascending: false }).limit(1);

    const maxCat = cats?.[0]?.id || 0;
    const maxProd = prods?.[0]?.id || 0;
    const maxUser = users?.[0]?.id || 0;

    // Ejecutar SQL para resetear las secuencias via RPC o PostgreSQL directo
    // Nota: necesitamos hacerlo via el pool de postgres de la NUEVA db
    // Esto lo hacemos via service role en el cliente de supabase
    const { error } = await newSupabase.rpc('fix_sequences', {
        cat_max: maxCat,
        prod_max: maxProd,
        user_max: maxUser
    }).catch(() => ({ error: null })); // si no existe el RPC, no importa

    console.log(`  Categorías: máx ID = ${maxCat}`);
    console.log(`  Productos: máx ID = ${maxProd}`);
    console.log(`  Usuarios: máx ID = ${maxUser}`);
    console.log('  ℹ️  Si creás nuevos registros y hay errores de ID duplicado,');
    console.log('     ejecutá este SQL en el nuevo Supabase:');
    console.log(`     SELECT setval(pg_get_serial_sequence('"Categories"', 'id'), ${maxCat});`);
    console.log(`     SELECT setval(pg_get_serial_sequence('"Products"', 'id'), ${maxProd});`);
    console.log(`     SELECT setval(pg_get_serial_sequence('"Users"', 'id'), ${maxUser});`);
}

// ─── MAIN ──────────────────────────────────────────────────────────────────

async function main() {
    console.log('🚀 PazSport - Migración de Datos');
    console.log('='.repeat(50));
    console.log(`  Origen: ${OLD_DB_URL.split('@')[1]}`);
    console.log(`  Destino: ${NEW_SUPABASE_URL}`);
    console.log(`  Storage: ${STORAGE_BUCKET}`);
    console.log('='.repeat(50));

    if (NEW_SUPABASE_SERVICE_KEY === 'PEGAR_AQUI_EL_SERVICE_ROLE_KEY') {
        console.error('\n❌ ERROR: Completá el SERVICE_ROLE_KEY en el script antes de ejecutarlo.');
        console.error('   Buscalo en: https://supabase.com/dashboard/project/bxrodymbbqzzlhtfamuy/settings/api');
        process.exit(1);
    }

    try {
        // Testear conexión a DB original
        await oldPool.query('SELECT 1');
        console.log('\n✅ Conexión a DB original OK');

        // Testear conexión a nuevo Supabase
        const { error: testErr } = await newSupabase.from('Categories').select('count').limit(1);
        if (testErr) throw new Error(`Nuevo Supabase: ${testErr.message}`);
        console.log('✅ Conexión a nuevo Supabase OK\n');

        await migrateCategories();
        await migrateProducts();
        await migrateUsers();
        await fixSequences();

        console.log('\n' + '='.repeat(50));
        console.log('🎉 ¡Migración completada exitosamente!');
        console.log('='.repeat(50));
        console.log('\nPróximos pasos:');
        console.log('  1. Verificar datos en: https://supabase.com/dashboard/project/bxrodymbbqzzlhtfamuy');
        console.log('  2. Verificar imágenes en Storage > product-images');
        console.log('  3. Actualizar el .env del backend con las nuevas credenciales');

    } catch (err) {
        console.error('\n❌ Error durante la migración:', err.message);
        process.exit(1);
    } finally {
        await oldPool.end();
    }
}

main();
