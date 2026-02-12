const db = require('./src/config/database');

async function checkTables() {
    try {
        console.log('Checking tables...');
        const res = await db.pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.table(res.rows);
        process.exit(0);
    } catch (err) {
        console.error('Error checking tables:', err);
        process.exit(1);
    }
}

checkTables();
