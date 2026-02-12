const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sql, getPool } = require('../config/database');

// POST /api/auth/login
async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son requeridos' });
        }

        const pool = await getPool();
        const result = await pool.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT * FROM Users WHERE email = @email');

        const user = result.recordset[0];

        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Error en login:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

// GET /api/auth/me - Obtener usuario actual
async function getMe(req, res) {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('id', sql.Int, req.user.id)
            .query('SELECT id, email, name, role FROM Users WHERE id = @id');

        const user = result.recordset[0];
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json(user);
    } catch (err) {
        console.error('Error en getMe:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

module.exports = { login, getMe };
