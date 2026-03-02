const db = require('./src/config/database');

async function run() {
    try {
        console.log('Adding discount column...');
        await db.query('ALTER TABLE "Products" ADD COLUMN IF NOT EXISTS discount INTEGER DEFAULT 0;');
        console.log('Column added successfully.');
    } catch (e) {
        console.error('Error adding column:', e);
    } finally {
        process.exit();
    }
}

run();
