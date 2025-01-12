const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const axios = require("axios");
const { crearPartido, verPartidos, eliminarPartido, editarPartido } = require("./db");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cors());

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const verificarCaptcha = async (token) => {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  const url = `https://www.google.com/recaptcha/api/siteverify`;

  try {
    const response = await axios.post(url, null, {
      params: {
        secret: secretKey,
        response: token,
      },
    });

    return response.data.success; // Devuelve true si la verificación es exitosa
  } catch (error) {
    console.error("Error al verificar reCAPTCHA:", error);
    return false;
  }
};

// Endpoint para manejar contacto
app.post("/contacto", async (req, res) => {
  const { nombre, email, mensaje, captchaToken } = req.body;

  // Verificar el token de reCAPTCHA
  const captchaValid = await verificarCaptcha(captchaToken);

  if (!captchaValid) {
    return res.status(400).send("Error: Fallo en la verificación de reCAPTCHA.");
  }

  const mailOptions = {
    from: email,
    to: process.env.EMAIL_USER,
    subject: `Comentario en formulario de ${nombre}`,
    text: `Mensaje de ${nombre} (${email}):\n\n${mensaje}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send("Correo enviado correctamente");
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    res.status(500).send("Hubo un error al enviar el correo");
  }
});

// Otros endpoints existentes
app.get("/partidos", async (req, res) => {
  try {
    const partidos = await verPartidos();
    res.json(partidos);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error del servidor");
  }
});

app.post("/partidos", async (req, res) => {
  try {
    const nuevoPartido = await crearPartido(req.body);
    res.status(201).json(nuevoPartido);
  } catch (err) {
    console.error(err.message);
    res.status(400).send(err.message);
  }
});

app.delete("/partidos/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const mensaje = await eliminarPartido(id);
    res.status(200).send(mensaje);
  } catch (err) {
    console.error(err.message);
    res.status(404).send(err.message);
  }
});

app.put("/partidos/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const partidoActualizado = await editarPartido(id, req.body);
    res.status(200).json(partidoActualizado);
  } catch (err) {
    console.error(err.message);
    res.status(400).send(err.message);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
