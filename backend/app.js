const express = require('express'); 
const mongoose = require('mongoose');
const helmet = require("helmet"); 
const xss = require('xss-clean'); 
const rateLimit = require("express-rate-limit"); 
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();


const userRoutes = require('./routes/user');
const sauceRoutes = require('./routes/sauces');

const app = express();

mongoose.connect(process.env.MONGO_URL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use(express.json());
app.use(helmet());
app.use(xss());

// Constante de limitation de temps de connection par IP. Module de Node Rate-limite
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windows
});

app.use(limiter);

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;