const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false },
});

const crearPartido = async (partido) => {
    const { equipo_1, equipo_2, resultado_equipo_1, resultado_equipo_2, fecha, estado  } = partido;

    if(!equipo_1 || !equipo_2 || !fecha || !estado) {
        throw new Error('Faltan datos obligatorios');
    }

    const estadosPermitidos = ['Jugado', 'Pendiente', 'Pospuesto', 'Cancelado'];

    if (!estadosPermitidos.includes(estado)) {
        throw new Error(`Estado inválido. Los estados permitidos son: ${estadosPermitidos.join(', ')}`)
    }

    const query = `INSERT INTO partidos (equipo_1, equipo_2, resultado_equipo_1, resultado_equipo_2, fecha, estado) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
    const values = [equipo_1, equipo_2, resultado_equipo_1 || null, resultado_equipo_2 || null, fecha, estado];
    
    const result = await pool.query(query, values);
    return result.rows[0];
};

module.exports = {pool, crearPartido};