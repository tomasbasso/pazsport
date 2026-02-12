const bcrypt = require('bcryptjs');
const db = require('./config/database');

async function seed() {
    try {
        // Verificar si ya existe un admin
        const existingResult = await db.query('SELECT COUNT(*) as count FROM "Users"');

        if (parseInt(existingResult.rows[0].count) > 0) {
            console.log('⚠️  Ya existe un usuario admin.');
            // Opcionalmente podríamos actualizar la contraseña del existente si es el mismo email
            // Pero por seguridad, si ya existe, asumimos que está bien o se gestiona aparte.
            // Si el usuario quiere forzarlo, podría borrar la tabla o hacer update aquí.
            // Dado el pedido "creame las credenciales", voy a hacer un UPSERT o simplemente informar.
            // Mejor hago un UPDATE por si acaso la password es vieja.
        }

        const email = 'admin@pazsport.com';
        const password = '26MariaPazSport';
        const hashedPassword = await bcrypt.hash(password, 10);
        const name = 'Administrador';
        const role = 'admin';

        // Intentar insertar o actualizar
        // Usamos ON CONFLICT si el email es unique, que lo es.
        const query = `
            INSERT INTO "Users" (email, password, name, role)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (email) 
            DO UPDATE SET password = $2, name = $3
            RETURNING *
        `;

        await db.query(query, [email, hashedPassword, name, role]);

        console.log('✅ Usuario admin configurado exitosamente:');
        console.log(`   📧 Email: ${email}`);
        console.log(`   🔑 Contraseña: ${password}`);
        console.log('');

        process.exit(0);
    } catch (err) {
        console.error('❌ Error en seed:', err);
        process.exit(1);
    }
}

seed();
