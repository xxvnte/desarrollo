const express = require("express");
const handlebars = require("express-handlebars");
const session = require('express-session');
const mongoose = require('mongoose');
const fs = require('fs');
const Evento = require('./models/evento');
const db = require("./models");
const Role = db.role;

require('dotenv').config();
const uri = process.env.MONGO_URI;

const app = express();

app.set("view engine", "hbs");
app.engine(
  "hbs",
  handlebars.engine({
    extname: "hbs",
    layoutsDir: `${__dirname}/views/layouts`,
    partialsDir: `${__dirname}/views/partials`,
    defaultLayout: "index",
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.set('strictQuery', true);
mongoose
  .connect(uri)
  .then(() => {
    console.log("Connected to Mongo Database");
    initial();
  })
  .catch((error) => {
    console.error(`Connection refused: ${error}`);
  });

const cors = require("cors");
var corsOptions = {
  origin: "http://localhost:3001"
};
app.use(cors(corsOptions));

const cookieSession = require("cookie-session");

app.use(
  cookieSession({
    name: "Encuestas.web",
    keys: ["COOKIE_SECRET"],
    httpOnly: true
  })
);

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

function initial() {
  Role.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      new Role({
        name: "user"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'user' to roles collection");
      });

      new Role({
        name: "admin"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'admin' to roles collection");
      });
    }
  });
}

app.get('/votaciones_main', async (req, res) => {
  try {
    const encuestas = await Evento.find().lean();
    res.render('layouts/votaciones', { encuestas, layout: false });
  } catch (error) {
    console.error('Hubo un error al obtener las votaciones:', error);
    res.status(500).send('Error al obtener las votaciones');
  }
});

app.get('/votar_evento', async (req, res) => {
  try {
    const encuestas = await Evento.find().lean();
    res.render('layouts/votar_evento', { encuestas, layout: false });
  } catch (error) {
    console.error('Hubo un error al obtener las votaciones:', error);
    res.status(500).send('Error al obtener las votaciones');
  }
});

initial();

module.exports = app;
