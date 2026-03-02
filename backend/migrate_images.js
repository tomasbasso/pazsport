const db = require('./src/config/database');

async function migrate() {
    try {
        console.log('Adding images column...');
        await db.query('ALTER TABLE "Products" ADD COLUMN IF NOT EXISTS images JSONB DEFAULT \'[]\'');

        console.log('Migrating data...');
        // Only migrate if it has an image and images is currently []
        await db.query(`
            UPDATE "Products" 
            SET images = jsonb_build_array(image) 
            WHERE image IS NOT NULL 
            AND image != '' 
            AND images::text = '[]'
        `);

        console.log('Migration complete.');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

migrate();