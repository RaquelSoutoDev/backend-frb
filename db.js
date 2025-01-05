const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false },
});

// Crear un partido
const crearPartido = async (partido) => {
  const { equipo_1, equipo_2, resultado_equipo_1, resultado_equipo_2, fecha, estado, tipo_partido, ubicacion } = partido;

  if (!equipo_1 || !equipo_2 || !fecha || !estado || !tipo_partido || !ubicacion) {
    throw new Error("Faltan datos obligatorios");
  }

  const query = `
  INSERT INTO partidos (equipo_1, equipo_2, resultado_equipo_1, resultado_equipo_2, fecha, estado, tipo_partido, ubicacion)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  RETURNING *;
`;
  const values = [equipo_1, equipo_2, resultado_equipo_1 || null, resultado_equipo_2 || null, fecha, estado, tipo_partido, ubicacion];
  const result = await pool.query(query, values);

  return result.rows[0];
};

// Ver partidos
const verPartidos = async () => {
  const query = "SELECT * FROM partidos ORDER BY fecha ASC";
  const result = await pool.query(query);
  return result.rows;
};

// Editar partido
const editarPartido = async (id, partido) => {
  const { equipo_1, equipo_2, resultado_equipo_1, resultado_equipo_2, fecha, estado, tipo_partido, ubicacion } = partido;

  const query = `
    UPDATE partidos
    SET
      equipo_1 = COALESCE($1, equipo_1),
      equipo_2 = COALESCE($2, equipo_2),
      resultado_equipo_1 = COALESCE($3, resultado_equipo_1),
      resultado_equipo_2 = COALESCE($4, resultado_equipo_2),
      fecha = COALESCE($5, fecha),
      estado = COALESCE($6, estado),
      tipo_partido = COALESCE($7, tipo_partido),
      ubicacion = COALESCE($8, ubicacion)
    WHERE id = $9
    RETURNING *;
  `;
  const values = [equipo_1, equipo_2, resultado_equipo_1, resultado_equipo_2, fecha, estado, tipo_partido, ubicacion, id];
  const result = await pool.query(query, values);

  if (result.rowCount === 0) {
    throw new Error(`No se encontró un partido con el ID: ${id}`);
  }

  return result.rows[0];
};

module.exports = { pool, crearPartido, verPartidos, editarPartido };
