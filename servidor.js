const express = require('express');
const { crearPartido, verPartidos, eliminarPartido }= require('./db');
require('dotenv').config();

const app = express();

app.use(express.json());

app.get('/partidos', async (req, res) => {
    try {
        const partidos = await verPartidos(); 
        res.json(partidos); 
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});

app.post('/partidos', async (req, res) => {
    try{
        const nuevoPartido = await crearPartido(req.body);
        res.status(201).json(nuevoPartido);
    } catch (err) {
        console.error(err.message);
        res.status(400).send(err.message);
    }
})

app.delete('/partidos/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const mensaje = await eliminarPartido(id);
        res.status(200).send(mensaje);
    } catch (err) {
        console.error(err.message);
        res.status(404).send(err.message);
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});