const { Pool } = require('pg');
const dayjs = require('dayjs'); 
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false },
});


const validarFecha = (fecha) => {
    if (!dayjs(fecha, "YYYY-MM-DDTHH:mm", true).isValid()) {
        throw new Error('Formato de fecha inválido');
    }
    return dayjs(fecha).toISOString(); 
};

const crearPartido = async (partido) => {
    const { equipo_1, equipo_2, resultado_equipo_1, resultado_equipo_2, fecha, estado, tipo_partido } = partido;

    if (!equipo_1 || !equipo_2 || !fecha || !estado || !tipo_partido) {
        throw new Error('Faltan datos obligatorios');
    }

    const fechaValidada = validarFecha(fecha); 

    const estadosPermitidos = ['Jugado', 'Pendiente', 'Pospuesto', 'Cancelado'];
    if (!estadosPermitidos.includes(estado)) {
        throw new Error(`Estado inválido. Los estados permitidos son: ${estadosPermitidos.join(', ')}`);
    }

    const tiposPermitidos = ['Amistoso', 'Liga-IMD', 'Torneo'];
    if (!tiposPermitidos.includes(tipo_partido)) {
        throw new Error(`Tipo de partido inválido. Los tipos permitidos son: ${tiposPermitidos.join(', ')}`);
    }

    const query = `INSERT INTO partidos (equipo_1, equipo_2, resultado_equipo_1, resultado_equipo_2, fecha, estado, tipo_partido) 
                   VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;
    const values = [equipo_1, equipo_2, resultado_equipo_1 || null, resultado_equipo_2 || null, fechaValidada, estado, tipo_partido];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const verPartidos = async () => {
    const query = 'SELECT * FROM partidos';
    const result = await pool.query(query);

    const partidos = result.rows.map((row) => ({
        ...row,
        fecha: new Date(row.fecha).toISOString(), 
    }));

    return partidos;
};

const eliminarPartido = async (id) => {
    const query = 'DELETE FROM partidos WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);

    if (result.rowCount === 0) {
        throw new Error(`No se encontró un partido con el ID: ${id}`);
    }

    return `El partido con ID ${id} fue eliminado exitosamente`;
};

const editarPartido = async (id, partido) => {
    const { equipo_1, equipo_2, resultado_equipo_1, resultado_equipo_2, fecha, estado, tipo_partido } = partido;

    const estadosPermitidos = ['Jugado', 'Pendiente', 'Pospuesto', 'Cancelado'];
    const tiposPermitidos = ['Amistoso', 'Liga-IMD', 'Torneo'];

    if (estado && !estadosPermitidos.includes(estado)) {
        throw new Error(`Estado inválido. Los estados permitidos son: ${estadosPermitidos.join(', ')}`);
    }

    if (tipo_partido && !tiposPermitidos.includes(tipo_partido)) {
        throw new Error(`Tipo de partido inválido. Los tipos permitidos son: ${tiposPermitidos.join(', ')}`);
    }

    
    const fechaValidada = fecha ? validarFecha(fecha) : null;

    const query = `
        UPDATE partidos
        SET
            equipo_1 = COALESCE($1, equipo_1),
            equipo_2 = COALESCE($2, equipo_2),
            resultado_equipo_1 = COALESCE($3, resultado_equipo_1),
            resultado_equipo_2 = COALESCE($4, resultado_equipo_2),
            fecha = COALESCE($5, fecha),
            estado = COALESCE($6, estado),
            tipo_partido = COALESCE($7, tipo_partido)
        WHERE id = $8
        RETURNING *;
    `;
    const values = [equipo_1, equipo_2, resultado_equipo_1, resultado_equipo_2, fechaValidada, estado, tipo_partido, id];
    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
        throw new Error(`Partido con ID ${id} no encontrado`);
    }

    return result.rows[0];
};

module.exports = { pool, crearPartido, verPartidos, eliminarPartido, editarPartido };
