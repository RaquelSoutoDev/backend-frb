const express = require('express');
const pool = require('./db');
require('dotenv').config();

const app = express();

app.use(express.json());

app.get('/partidos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM partidos');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});