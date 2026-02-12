const { Client } = require('pg');
require('dotenv').config();

// Construct URL with port 5432 instead of 6543
const originalUrl = process.env.DATABASE_URL;
const url5432 = originalUrl.replace(':6543', ':5432');

console.log('Testing connection to:', url5432.replace(/:[^:@]+@/, ':****@')); // Hide password

const client = new Client({
    connectionString: url5432,
    ssl: { rejectUnauthorized: false }
});

async function test() {
    try {
        await client.connect();
        console.log('✅ Connected successfully to port 5432!');
        const res = await client.query('SELECT NOW()');
        console.log('Query result:', res.rows[0]);
        await client.end();
        process.exit(0);
    } catch (err) {
        console.error('❌ Connection failed:', err.message);
        process.exit(1);
    }
}

test();
