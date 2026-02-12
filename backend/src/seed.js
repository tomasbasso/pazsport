/**
 * Script para crear el usuario admin inicial
 * Ejecutar: npm run seed
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sql, getPool } = require('./config/database');

async function seed() {
    try {
        const pool = await getPool();

        // Verificar si ya existe un admin
        const existing = await pool.request()
            .query('SELECT COUNT(*) as count FROM Users');

        if (existing.recordset[0].count > 0) {
            console.log('⚠️  Ya existe un usuario admin. No se creará otro.');
            process.exit(0);
        }

        // Crear admin por defecto
        const email = 'admin@pazsport.com';
        const password = 'PazSport2024';
        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.request()
            .input('email', sql.NVarChar, email)
            .input('password', sql.NVarChar, hashedPassword)
            .input('name', sql.NVarChar, 'Administrador')
            .input('role', sql.NVarChar, 'admin')
            .query(`
        INSERT INTO Users (email, password, name, role)
        VALUES (@email, @password, @name, @role)
      `);

        console.log('✅ Usuario admin creado exitosamente:');
        console.log(`   📧 Email: ${email}`);
        console.log(`   🔑 Contraseña: ${password}`);
        console.log('');
        console.log('⚠️  Cambiá la contraseña después del primer login!');

        process.exit(0);
    } catch (err) {
        console.error('❌ Error en seed:', err);
        process.exit(1);
    }
}

seed();
