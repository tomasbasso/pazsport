const db = require('./src/config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

require('dotenv').config();

async function simulateLogin() {
    try {
        const email = 'admin@pazsport.com';
        const password = '26MariaPazSport';

        console.log('Simulating login for:', email);

        // 1. Query User
        console.log('Executing query...');
        const result = await db.query('SELECT * FROM "Users" WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            console.error('❌ User not found');
            process.exit(1);
        }
        console.log('✅ User found:', user.email);

        // 2. Validate Password
        console.log('Hashing provided password to compare...');
        // Hash it just to see
        // const hash = await bcrypt.hash(password, 10);
        // console.log('New hash:', hash);
        // console.log('Stored hash:', user.password);

        console.log('Comparing passwords...');
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            console.error('❌ Invalid password');
            process.exit(1);
        }
        console.log('✅ Password valid');

        // 3. Generate Token
        console.log('Generating token...');
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );
        console.log('✅ Token generated:', token.substring(0, 20) + '...');

        console.log('Login simulation SUCCESS');
        process.exit(0);

    } catch (err) {
        console.error('❌ Login simulation FAILED:', err);
        process.exit(1);
    }
}

simulateLogin();
