const express = require('express');
const { crearPartido }= require('./db');
require('dotenv').config();

const app = express();

app.use(express.json());

app.post('/partidos', async (requestAnimationFrame, res) => {
    try{
        const nuevoPartido = await crearPartido(req.body);
        res.status(201).json(nuevoPartido);
    } catch (err) {
        console.error(err.message);
        res.status(400).send(err.message);
    }
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});